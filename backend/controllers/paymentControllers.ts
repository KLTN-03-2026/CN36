import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "../config/dbConnect";
import Booking from "../models/booking";

export const createMomoPayment = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { amount, orderInfo = "Thanh toan MoMo", bookingId = "" } = body;
        const extraData = bookingId ? Buffer.from(bookingId).toString("base64") : "";

        if (!amount) {
            return NextResponse.json({ ok: false, message: "amount is required" }, { status: 400 });
        }

        const partnerCode = process.env.MOMO_PARTNER_CODE || "";
        const accessKey = process.env.MOMO_ACCESS_KEY || "";
        const secretKey = process.env.MOMO_SECRET_KEY || "";
        const momoEndpoint = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";
        
        // Dynamically grab the host url for Return URL (no Ngrok needed)
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const baseUrl = `${protocol}://${host}`;
        
        const returnUrl = process.env.MOMO_RETURN_URL || `${baseUrl}/api/payment/momo/return`;
        const ipnUrl = process.env.MOMO_IPN_URL || `${baseUrl}/api/payment/momo/ipn`;

        if (!partnerCode || !accessKey || !secretKey) {
            return NextResponse.json({ ok: false, message: "Missing MoMo configuration in environment variables" }, { status: 500 });
        }

        const requestId = partnerCode + Date.now();
        const orderId = requestId; // You can use a real booking ID from DB here later if needed
        const requestType = "captureWallet";

        // Build raw signature string exactly in this order:
        const rawSignature =
            `accessKey=${accessKey}` +
            `&amount=${amount}` +
            `&extraData=${extraData}` +
            `&ipnUrl=${ipnUrl}` +
            `&orderId=${orderId}` +
            `&orderInfo=${orderInfo}` +
            `&partnerCode=${partnerCode}` +
            `&redirectUrl=${returnUrl}` +
            `&requestId=${requestId}` +
            `&requestType=${requestType}`;

        const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

        const payload = {
            partnerCode,
            accessKey,
            requestId,
            amount: String(amount),
            orderId,
            orderInfo,
            redirectUrl: returnUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: "vi",
        };

        const resp = await fetch(momoEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await resp.json();

        return NextResponse.json({ ok: true, momo: data, orderId });
    } catch (err: any) {
        console.error("create-payment error:", err.message || err);
        return NextResponse.json({ ok: false, error: err.message || "Unknown error" }, { status: 500 });
    }
};

export const momoIpnCallback = async (req: NextRequest) => {
    try {
        const body = await req.json();
        console.log("IPN Received from MoMo:", body);

        const accessKey = process.env.MOMO_ACCESS_KEY || "";
        const secretKey = process.env.MOMO_SECRET_KEY || "";

        // Required fields from MoMo IPN
        const rawSignature =
            `accessKey=${accessKey}` +
            `&amount=${body.amount || ""}` +
            `&extraData=${body.extraData || ""}` +
            `&message=${body.message || ""}` +
            `&orderId=${body.orderId || ""}` +
            `&orderInfo=${body.orderInfo || ""}` +
            `&orderType=${body.orderType || ""}` +
            `&partnerCode=${body.partnerCode || ""}` +
            `&payType=${body.payType || ""}` +
            `&requestId=${body.requestId || ""}` +
            `&responseTime=${body.responseTime || ""}` +
            `&resultCode=${body.resultCode || ""}`;

        const expectedSignature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

        if (expectedSignature !== body.signature) {
            console.error("MoMo IPN Signature Mismatch!");
            return NextResponse.json({ message: "Invalid Signature" }, { status: 400 });
        }

        // Result code 0 = Success
        if (body.resultCode == 0) {
            const bookingId = body.extraData ? Buffer.from(body.extraData, "base64").toString("utf-8") : null;
            if (bookingId) {
                await dbConnect();
                const booking = await Booking.findById(bookingId);
                
                if (booking && booking.paymentInfo.status !== "paid") {
                    booking.paymentInfo.status = "paid";
                    booking.paymentInfo.id = body.transId || body.orderId;
                    booking.paidAt = Date.now();
                    await booking.save();
                    console.log(`Booking ${bookingId} payment successful!`);
                }
            }
        }

        // Standard IPN res - no content needed but MoMo requires HTTP 200 or 204
        return NextResponse.json({ message: "Received" }, { status: 200 }); 
    } catch (error) {
        console.error("IPN Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export const momoReturnCallback = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        
        const accessKey = process.env.MOMO_ACCESS_KEY || "";
        const secretKey = process.env.MOMO_SECRET_KEY || "";

        const amount = searchParams.get("amount") || "";
        const extraData = searchParams.get("extraData") || "";
        const message = searchParams.get("message") || "";
        const orderId = searchParams.get("orderId") || "";
        const orderInfo = searchParams.get("orderInfo") || "";
        const orderType = searchParams.get("orderType") || "";
        const partnerCode = searchParams.get("partnerCode") || "";
        const payType = searchParams.get("payType") || "";
        const requestId = searchParams.get("requestId") || "";
        const responseTime = searchParams.get("responseTime") || "";
        const resultCode = searchParams.get("resultCode") || "";
        const signature = searchParams.get("signature") || "";
        const transId = searchParams.get("transId") || "";

        const rawSignature =
            `accessKey=${accessKey}` +
            `&amount=${amount}` +
            `&extraData=${extraData}` +
            `&message=${message}` +
            `&orderId=${orderId}` +
            `&orderInfo=${orderInfo}` +
            `&orderType=${orderType}` +
            `&partnerCode=${partnerCode}` +
            `&payType=${payType}` +
            `&requestId=${requestId}` +
            `&responseTime=${responseTime}` +
            `&resultCode=${resultCode}`;

        const expectedSignature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

        if (expectedSignature !== signature) {
            console.error("MoMo Return Signature Mismatch!");
            return NextResponse.redirect(new URL("/?error=invalid_signature", req.url));
        }

        if (resultCode === "0") {
            const bookingId = extraData ? Buffer.from(extraData, "base64").toString("utf-8") : null;
            if (bookingId) {
                await dbConnect();
                const booking = await Booking.findById(bookingId);
                
                if (booking && booking.paymentInfo.status !== "paid") {
                    booking.paymentInfo.status = "paid";
                    booking.paymentInfo.id = transId || orderId;
                    booking.paidAt = Date.now();
                    await booking.save();
                }
                // Redirect user to their bookings page to see the updated status
                return NextResponse.redirect(new URL(`/bookings/${bookingId}`, req.url));
            }
        }

        // If failed or cancelled
        return NextResponse.redirect(new URL("/?error=payment_failed", req.url));
    } catch (error) {
        console.error("Return URL Error:", error);
        return NextResponse.redirect(new URL("/?error=internal_error", req.url));
    }
};
