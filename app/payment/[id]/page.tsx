import React, { Suspense } from "react";
import "@/components/payment/payment.css";
import Payment from "@/components/payment/Payment";

export const metadata = {
    title: "Thanh toán MoMo - Demo",
};

interface Props {
    params: { id: string };
}

const PaymentPage = ({ params }: Props) => {
    return (
        <Suspense fallback={<div className="container mt-5 text-center">Đang tải trang thanh toán...</div>}>
            <Payment bookingId={params.id} />
        </Suspense>
    );
};

export default PaymentPage;
