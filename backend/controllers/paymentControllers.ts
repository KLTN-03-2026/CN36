import { NextRequest, NextResponse } from "next/server";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import crypto from "crypto";
import Booking from "../models/booking";
import dbConnect from "../config/dbConnect";

// Create MoMo Payment   =>  /api/payment/momo
export const createMomoPayment = catchAsyncErrors(async (req: NextRequest) => {
    const body = await req.json();
    const { amount, bookingId } = body;

    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY as string;
    const orderId = bookingId;
    const requestId = bookingId;
    const orderInfo = "Thanh toán đặt phòng tạii BookRoom";
    const redirectUrl = `${process.env.API_URL}/bookings/me`;
    const ipnUrl = `${process.env.API_URL}/api/payment/momo/ipn`;
    const requestType = "captureWallet";
    const extraData = ""; // pass empty string if not used
    
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

    const requestBody = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: "vi",
    };

    const response = await fetch("https://test-payment.momo.vn/v2/gateway/api/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    return NextResponse.json(result);
});

// MoMo IPN Callback   =>  /api/payment/momo/ipn
export const momoIpnCallback = catchAsyncErrors(async (req: NextRequest) => {
    const body = await req.json();
    const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature: momoSignature,
    } = body;

    const secretKey = process.env.MOMO_SECRET_KEY as string;

    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

    if (signature !== momoSignature) {
        return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    if (resultCode === 0) {
        await dbConnect();
        
        const booking = await Booking.findById(orderId);
        
        if (booking) {
            booking.paymentInfo = {
                id: transId.toString(),
                status: "paid",
            };
            booking.paidAt = Date.now();
            await booking.save();
        }
    }

    return NextResponse.json({ success: true });
});
