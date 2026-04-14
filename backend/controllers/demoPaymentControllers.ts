import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/backend/config/dbConnect";
import Booking from "@/backend/models/booking";
import { catchAsyncErrors } from "@/backend/middlewares/catchAsyncErrors";

export const fakeConfirmPayment = catchAsyncErrors(async (req: NextRequest) => {
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
        return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    await dbConnect();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    booking.paymentInfo.status = "paid";
    booking.paymentInfo.id = "DEMO_TRANS_" + Date.now();
    booking.paidAt = Date.now();
    await booking.save();

    return NextResponse.json({ success: true, message: "Payment confirmed" });
});
