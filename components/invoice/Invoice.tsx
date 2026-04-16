"use client";

import { IBooking } from "@/backend/models/booking";
import React from "react";

import "./Invoice.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Props {
  data: {
    booking: IBooking;
  };
}

const Invoice = ({ data }: Props) => {
  const booking = data?.booking;

  const handleDownload = () => {
    const input = document.getElementById("booking_invoice");
    if (input) {
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF();
        const pdfWidth = pdf.internal.pageSize.getWidth();
        pdf.addImage(imgData, 0, 0, pdfWidth, 0);
        pdf.save(`invoice_${booking?._id}.pdf`);
      });
    }
  };

  return (
    <div className="container order-invoice-container">
      <div className="download-btn-container my-5">
        <button className="btn btn-premium" onClick={handleDownload}>
          <i className="fa fa-print me-2"></i> Download Digital Invoice
        </button>
      </div>

      <div id="booking_invoice" className="shadow-lg rounded">
        <div className="invoice-header">
          <div className="invoice-brand">
            <h1>BOOKROOM</h1>
            <div className={`invoice-badge badge-paid`}>
              {booking?.paymentInfo?.status?.toUpperCase()}
            </div>
          </div>
          <div className="invoice-meta">
            <h2>Invoice Number</h2>
            <p>#{booking?._id?.substring(0, 8).toUpperCase()}</p>
            <div className="mt-3">
              <h2 className="mb-0">Date Issued</h2>
              <p style={{ fontSize: "1rem" }}>
                {new Date(booking?.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="invoice-info">
          <div className="info-block">
            <h3>From</h3>
            <p><strong>BookRoom Luxury Stays</strong></p>
            <p>07 Quang Trung, Hai Chau</p>
            <p>Da Nang, Viet Nam</p>
            <p>thienmenh890@gmail.com</p>
          </div>
          <div className="info-block">
            <h3>Billed To</h3>
            <p><strong>{booking?.user?.name}</strong></p>
            <p>{booking?.user?.email}</p>
          </div>
        </div>

        <div className="invoice-items">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th className="text-end">Stay</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="item-name">{booking?.room?.name}</div>
                  <div className="text-muted small">
                    {booking?.room?.address}
                  </div>
                </td>
                <td>
                  {new Date(booking?.checkInDate).toLocaleDateString("en-US")}
                </td>
                <td>
                  {new Date(booking?.checkOutDate).toLocaleDateString("en-US")}
                </td>
                <td className="text-end">{booking?.daysOfStay} Nights</td>
                <td className="text-end">
                  {booking?.room?.pricePerNight?.toLocaleString()} VND
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="invoice-summary">
          <div className="summary-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{booking?.amountPaid?.toLocaleString()} VND</span>
            </div>
            <div className="summary-row">
              <span>Tax (0%)</span>
              <span>0 VND</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total</span>
              <span>{booking?.amountPaid?.toLocaleString()} VND</span>
            </div>
          </div>
        </div>

        <div className="invoice-footer">
          <p>Thank you for choosing BookRoom for your luxury stay.</p>
          <p className="mt-2">
            This is a computer-generated document and requires no signature.
          </p>
        </div>
      </div>
    </div>
  );
};


export default Invoice;
