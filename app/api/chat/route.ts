import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/config/dbConnect";
import Room from "@/backend/models/room";
import Booking from "@/backend/models/booking";


const LOCATION_CONFIG = [
  { keys: ["ha noi", "hanoi"], displayName: "Hà Nội", dbRegex: "ha.?noi|h.\\s*n.i|hanoi" },
  { keys: ["ho chi minh", "hcm", "sai gon", "saigon", "tp hcm"], displayName: "Hồ Chí Minh", dbRegex: "ho.?chi.?minh|sai.?gon|hcm|saigon" },
  { keys: ["da nang", "danang"], displayName: "Đà Nẵng", dbRegex: "da.?nang|danang|\u0111\u00e0.?n\u1eb5ng" },
  { keys: ["hoi an", "hoian"], displayName: "Hội An", dbRegex: "hoi.?an|hoian|h.i.?an" },
  { keys: ["nha trang", "nhatrang"], displayName: "Nha Trang", dbRegex: "nha.?trang|nhatrang" },
  { keys: ["phu quoc", "phuquoc"], displayName: "Phú Quốc", dbRegex: "phu.?quoc|phuquoc|ph\u00fa.?qu\u1ed1c" },
  { keys: ["da lat", "dalat"], displayName: "Đà Lạt", dbRegex: "da.?lat|dalat|\u0111\u00e0.?l\u1ea1t" },
  { keys: ["hue"], displayName: "Huế", dbRegex: "\\bhue\\b|hu\u1ebf" },
  { keys: ["vung tau", "vungtau"], displayName: "Vũng Tàu", dbRegex: "vung.?tau|vungtau|v\u0169ng.?t\u00e0u" },
  { keys: ["ha long", "halong"], displayName: "Hạ Long", dbRegex: "ha.?long|halong|h\u1ea1.?long" },
  { keys: ["cat ba", "catba"], displayName: "Cát Bà", dbRegex: "cat.?ba|catba|c\u00e1t.?b\u00e0" },
];

const VIEW_KEYWORDS = [
  {
    keys: ["view bien", "huong bien", "gan bien", "canh bien", "ven bien", "bien", "beach", "sea"], label: "view biển",
    regex: "bi.n|ven.{0,4}bi|beach"
  },
  { keys: ["view ho", "ho nuoc", "lake view", "ben ho"], label: "view hồ", regex: "h\u1ed3|lake" },
  {
    keys: ["view nui", "canh nui", "mountain view"], label: "view núi",
    regex: "view n.i|canh n.i|resort n.i|mountain"
  },
  { keys: ["trung tam", "trung tam tp", "city center", "downtown"], label: "trung tâm", regex: "trung.?t\u00e2m|center|downtown" },
  { keys: ["yen tinh", "peaceful", "tach biet"], label: "yên tĩnh", regex: "y\u00ean.?t\u0129nh|peaceful" },
];


function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0111/g, "d");
}


function parseDates(text: string) {
  let checkIn: Date | null = null;
  let checkOut: Date | null = null;

  const tuDen = text.match(/(?:tu|from)\s+[^\d]*?(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{4})?)[^\d]*?(?:den|to|cho den)\s+[^\d]*?(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{4})?)/);
  if (tuDen) {
    checkIn = parseDate(tuDen[1]);
    checkOut = parseDate(tuDen[2]);
    return { checkIn, checkOut };
  }
  const all = [...text.matchAll(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{4})?)/g)];
  if (all.length >= 2) { checkIn = parseDate(all[0][1]); checkOut = parseDate(all[1][1]); }
  else if (all.length === 1) { checkIn = parseDate(all[0][1]); }
  return { checkIn, checkOut };
}

function parseDate(s: string): Date | null {
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/);
  if (!m) return null;
  const d = new Date(m[3] ? parseInt(m[3]) : new Date().getFullYear(), parseInt(m[2]) - 1, parseInt(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

function parseIntent(rawMsg: string) {
  const text = norm(rawMsg);
  const filters: any = {};
  const replies: string[] = [];


  const underM = text.match(/(?:duoi|khong qua|toi da|under|max|<)\s*(\d[\d.,]*)\s*(k|trieu|ngan|nghin|vnd|dong)?/);
  if (underM) {
    let v = parseFloat(underM[1].replace(/[.,]/g, "")); const u = underM[2] || "";
    if (u.includes("trieu")) v *= 1e6; else if (u === "k" || u.includes("ngan") || u.includes("nghin")) v *= 1e3;
    if (v > 0) { filters.maxPrice = v; replies.push(`giá dưới ${v.toLocaleString("vi-VN")} VND`); }
  }
  const overM = text.match(/(?:tren|over|min|>=?)\s*(\d[\d.,]*)\s*(k|trieu|ngan|nghin|vnd)?/);
  if (overM) {
    let v = parseFloat(overM[1].replace(/[.,]/g, "")); const u = overM[2] || "";
    if (u.includes("trieu")) v *= 1e6; else if (u === "k" || u.includes("ngan") || u.includes("nghin")) v *= 1e3;
    if (v > 0) { filters.minPrice = v; replies.push(`giá từ ${v.toLocaleString("vi-VN")} VND`); }
  }

  if (/\bking\b/.test(text)) { filters.category = "King"; replies.push("loại King"); }
  else if (/\b(doi|twin|2\s*giuong|hai\s*giuong)\b/.test(text)) { filters.category = "Twins"; replies.push("loại Twins"); }
  else if (/\b(don|single|1\s*giuong|mot\s*giuong)\b/.test(text)) { filters.category = "Single"; replies.push("loại Single"); }

  if (/wifi|internet/.test(text)) { filters.isInternet = true; replies.push("có WiFi"); }
  if (/bua\s*sang|breakfast/.test(text)) { filters.isBreakfast = true; replies.push("có bữa sáng"); }
  if (/dieu\s*hoa|air\s*con|mat\s*lanh/.test(text)) { filters.isAirConditioned = true; replies.push("có điều hòa"); }
  if (/thu\s*cung|cho\s*meo|\bpet\b/.test(text)) { filters.isPetsAllowed = true; replies.push("cho phép thú cưng"); }
  if (/don\s*phong|cleaning/.test(text)) { filters.isRoomCleaning = true; replies.push("có dọn phòng"); }


  let guestCount: number | null = null;
  for (const pat of [
    /(\d+)\s*(?:nguoi|khach|guest|people|person)\b/,
    /(?:danh\s*cho|cho|du\s*lich|phong\s*cho)\s+(\d+)/,
    /(\d+)\s*(?:nguoi|khach)/,
  ]) {
    const m = text.match(pat);
    if (m) { guestCount = parseInt(m[1]); break; }
  }
  if (guestCount && guestCount > 0 && guestCount < 20) {
    filters.minGuests = guestCount;
    replies.push(`${guestCount} khách`);
  }

  if (/tot nhat|5 sao|hang dau|chat luong/.test(text)) { filters.minRating = 4; replies.push("đánh giá cao"); }
  else if (/\b4 sao/.test(text)) { filters.minRating = 3.5; replies.push("đánh giá khá"); }


  for (const loc of LOCATION_CONFIG) {
    if (loc.keys.some((kw) => text.includes(kw))) {
      filters.locationRegex = loc.dbRegex;
      filters.locationName = loc.displayName;
      replies.push(`tại ${loc.displayName}`);
      break;
    }
  }


  for (const vk of VIEW_KEYWORDS) {
    if (vk.keys.some((kw) => text.includes(kw))) {
      filters.viewRegex = vk.regex;
      filters.viewLabel = vk.label;
      replies.push(vk.label);
      break;
    }
  }


  const { checkIn, checkOut } = parseDates(text);
  if (checkIn) { filters.checkIn = checkIn; replies.push(`check-in ${checkIn.toLocaleDateString("vi-VN")}`); }
  if (checkOut) { filters.checkOut = checkOut; replies.push(`check-out ${checkOut.toLocaleDateString("vi-VN")}`); }

  let sort: any = { ratings: -1 };
  if (/re nhat|gia thap|cheapest|thap nhat/.test(text)) sort = { pricePerNight: 1 };
  else if (/dat nhat|cao nhat|expensive/.test(text)) sort = { pricePerNight: -1 };

  const replyText = replies.length > 0
    ? `Tôi đang tìm phòng ${replies.join(", ")} cho bạn... 🔍`
    : "Để tôi tìm tất cả phòng đang có nhé! Bạn thêm yêu cầu như giá, vị trí, tiện nghi để lọc cụ thể hơn.";

  return { filters, sort, replyText };
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

    if (/^(xin chao|hello|hi|chao|hey|alo)/i.test(message.trim())) {
      return NextResponse.json({
        reply: "Xin chào! 👋 Tôi có thể giúp bạn tìm phòng theo ngày check-in/out, vị trí, view biển/núi, số khách, giá cả, tiện nghi. Hãy thử hỏi tôi nhé!",
        rooms: [],
      });
    }

    const { filters, sort, replyText } = parseIntent(message);

    await dbConnect();


    let bookedRoomIds: any[] = [];
    if (filters.checkIn && filters.checkOut) {
      const overlapping = await Booking.find({
        checkInDate: { $lt: filters.checkOut },
        checkOutDate: { $gt: filters.checkIn },
      }).select("room");
      bookedRoomIds = overlapping.map((b) => b.room);
    }


    const base: any = {};
    if (filters.maxPrice) base.pricePerNight = { ...base.pricePerNight, $lte: filters.maxPrice };
    if (filters.minPrice) base.pricePerNight = { ...base.pricePerNight, $gte: filters.minPrice };
    if (filters.minGuests) base.guestCapacity = { $gte: filters.minGuests, $lte: filters.minGuests + 1 };
    if (filters.category) base.category = filters.category;
    if (filters.isInternet) base.isInternet = true;
    if (filters.isBreakfast) base.isBreakfast = true;
    if (filters.isAirConditioned) base.isAirConditioned = true;
    if (filters.isPetsAllowed) base.isPetsAllowed = true;
    if (filters.isRoomCleaning) base.isRoomCleaning = true;
    if (filters.minRating) base.ratings = { $gte: filters.minRating };
    if (bookedRoomIds.length > 0) base._id = { $nin: bookedRoomIds };


    const locationClause = filters.locationRegex ? {
      $or: [
        { name: { $regex: filters.locationRegex, $options: "i" } },
        { address: { $regex: filters.locationRegex, $options: "i" } },
        { "location.city": { $regex: filters.locationRegex, $options: "i" } },
        { "location.formattedAddress": { $regex: filters.locationRegex, $options: "i" } },
        { "location.state": { $regex: filters.locationRegex, $options: "i" } },
      ],
    } : null;


    const viewClause = filters.viewRegex ? {
      $or: [
        { name: { $regex: filters.viewRegex, $options: "i" } },
        { description: { $regex: filters.viewRegex, $options: "i" } },
        { address: { $regex: filters.viewRegex, $options: "i" } },
      ],
    } : null;

    const selectFields = "name pricePerNight guestCapacity numOfBeds category isInternet isBreakfast isAirConditioned isPetsAllowed isRoomCleaning ratings images address _id";

    const tryQuery = async (extra: any[]) => {
      const q: any = { ...base };
      if (extra.length > 0) q.$and = extra;
      return Room.find(q).select(selectFields).sort(sort).limit(6);
    };

    const andAll = [locationClause, viewClause].filter(Boolean) as any[];
    let rooms = await tryQuery(andAll);

    if (rooms.length === 0 && locationClause && viewClause) {
      rooms = await tryQuery([locationClause]);
      if (rooms.length > 0) {
        return NextResponse.json({
          reply: `Không tìm thấy phòng có ${filters.viewLabel} tại ${filters.locationName}, nhưng đây là các phòng tại ${filters.locationName}:`,
          rooms,
        });
      }
    }

    if (rooms.length === 0 && viewClause) {
      rooms = await tryQuery([viewClause]);
      if (rooms.length > 0) {
        return NextResponse.json({
          reply: `Không tìm thấy phòng tại ${filters.locationName || ""}, nhưng đây là các phòng có ${filters.viewLabel}:`,
          rooms,
        });
      }
    }

    if (rooms.length === 0 && filters.minGuests) {
      delete base.guestCapacity;
      base.guestCapacity = { $gte: filters.minGuests };
      rooms = await tryQuery(andAll);
    }

    if (rooms.length === 0 && locationClause) {
      rooms = await tryQuery([locationClause]);
      if (rooms.length > 0) {
        return NextResponse.json({
          reply: `Không tìm thấy phòng đúng tiêu chí tại ${filters.locationName}, nhưng đây là các phòng có sẵn tại ${filters.locationName}:`,
          rooms,
        });
      }
    }

    return NextResponse.json({ reply: replyText, rooms });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
