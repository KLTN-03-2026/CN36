"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaymentProps {
    bookingId?: string;
}

const Payment = ({ bookingId }: PaymentProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [amount, setAmount] = useState<string>("");
    const [orderInfo, setOrderInfo] = useState<string>("");

    useEffect(() => {
        const queryAmount = searchParams.get("amount");
        const queryOrderInfo = searchParams.get("orderInfo");

        if (queryAmount) {
            setAmount(parseInt(queryAmount, 10).toLocaleString("en-US"));
        } else {
            setAmount("15,000");
        }

        if (queryOrderInfo) {
            setOrderInfo(`Thanh toan booking `);
        } else if (bookingId) {
            setOrderInfo(`Thanh toan booking `);
        } else {
            setOrderInfo("Thanh toan demo SV");
        }
    }, [searchParams, bookingId]);
    const [status, setStatus] = useState<{ message: string; type: "error" | "success" | "" }>({ message: "", type: "" });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [debugData, setDebugData] = useState<string>("// Chờ dữ liệu từ API...");

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value) {
            setAmount(parseInt(value, 10).toLocaleString("en-US"));
        } else {
            setAmount("");
        }
    };

    const handlePayment = async () => {
        setStatus({ message: "", type: "" });
        setIsLoading(true);

        try {
            const resp = await fetch("/api/payment/demo-confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId }),
            });
            const data = await resp.json();

            if (data.success) {
                setStatus({ message: " Xác nhận thành công! Đang trở về...", type: "success" });
                router.refresh();
                setTimeout(() => {
                    router.push(`/bookings/${bookingId}`);
                }, 1000);
            } else {
                setStatus({ message: " Lỗi giả lập: " + data.error, type: "error" });
                setIsLoading(false);
            }
        } catch (err) {
            setStatus({ message: " Lỗi kết nối server.", type: "error" });
            setIsLoading(false);
        }
    };

    const momoPersonalUrl = "https://me.momo.vn/eJIGuwfjFlUdTjUPIBt6";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(momoPersonalUrl)}`;

    return (
        <div className="container">
            <br />

            <h1 className="main-title">Thanh Toán Bằng MoMo (Demo)</h1>

            <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ marginBottom: "15px", fontWeight: "bold", fontSize: "1.1rem" }}>Quét Mã QR Bên Dưới Để Chuyển Tiền</p>
                <div style={{ padding: "10px", background: "#fff", border: "2px solid #d82d8b", borderRadius: "10px", display: "inline-block" }}>
                    <img src={qrCodeUrl} alt="MoMo QR Code" style={{ width: "200px", height: "200px" }} />
                </div>
                
                <div style={{ marginTop: "20px", width: "100%", background: "#f5f6fd", padding: "15px", borderRadius: "10px", textAlign: "left" }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#333e48" }}>Chi tiết giao dịch:</h4>
                    <p style={{ margin: "5px 0" }}>Số tiền: <strong>{amount} VND</strong></p>
                    <p style={{ margin: "5px 0" }}>Nội dung: <strong>{orderInfo}</strong></p>
                </div>
                <button id="payBtn" className={`btn-pay ${isLoading ? "loading" : ""}`} disabled={isLoading} onClick={handlePayment} style={{ marginTop: "25px" }}>
                    <span className="spinner"></span>
                    <span className="btn-text">{isLoading ? "Đang xử lý..." : "Xác nhận đã chuyển khoản"}</span>
                </button>

                {status.message && (
                    <p id="status" className={`status-${status.type}`}>
                        {status.message}
                    </p>
                )}
            </div>

            <div className="info-box">
                <h4>Hướng dẫn trải nghiệm:</h4>
                <ul>
                    <li>Dùng ứng dụng <strong>MoMo</strong> quét mã QR phía trên.</li>
                    <li>Sau khi chuyển khoản thành công, nhấn vào nút xác nhận.</li>
                    <li>Hệ thống sẽ ghi nhận thanh toán và cập nhật vé dịch vụ.</li>
                </ul>
            </div>

        </div>
    );
};

export default Payment;