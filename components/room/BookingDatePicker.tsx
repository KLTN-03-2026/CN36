"use client";

import { IRoom } from "@/backend/models/room";
import { calculateDaysOfStay } from "@/helpers/helpers";
import {
  useGetBookedDatesQuery,
  useLazyCheckBookingAvailabilityQuery,
  useNewBookingMutation,
} from "@/redux/api/bookingApi";
import React, { useState } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  room: IRoom;
}

const BookingDatePicker = ({ room }: Props) => {
  const { t } = useLanguage();
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [daysOfStay, setDaysOfStay] = useState(0);

  const [newBooking] = useNewBookingMutation();

  const [checkBookingAvailability, { data }] =
    useLazyCheckBookingAvailabilityQuery();

  const isAvailable = data?.isAvailable;

  const { data: { bookedDates: dates } = {} } = useGetBookedDatesQuery(
    room._id
  );
  const excludeDates = dates?.map((date: string) => new Date(date)) || [];

  const onChange = (dates: Date[]) => {
    const [checkInDate, checkOutDate] = dates;

    if (checkInDate) {
      checkInDate.setHours(14, 0, 0, 0);
    }
    if (checkOutDate) {
      checkOutDate.setHours(12, 0, 0, 0);
    }
    setCheckInDate(checkInDate);
    setCheckOutDate(checkOutDate);
    if (checkInDate && checkOutDate) {
      const days = calculateDaysOfStay(checkInDate, checkOutDate);

      setDaysOfStay(days);

      // check booking availability
      checkBookingAvailability({
        id: room._id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
      });
    }
  };

  const router = useRouter();

  const bookRoom = async () => {
    const bookingData = {
      room: room?._id,
      checkInDate,
      checkOutDate,
      daysOfStay,
      amountPaid: room.pricePerNight * daysOfStay,
      paymentInfo: {
        id: "MOMO_DEMO",
        status: "Not Paid",
      },
    };
    try {
      const res = await newBooking(bookingData).unwrap();
      if (res?.booking?._id) {
        router.push(`/payment/${res.booking._id}?amount=${bookingData.amountPaid}`);
      }
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  return (
    <div className="booking-card shadow p-4">
      <p className="price-per-night">
        <b>{room?.pricePerNight?.toLocaleString()} VND</b> / {t("room.per_night")}
      </p>

      <hr />

      <p className="mt5 mb-3">{t("booking.pick_dates")}</p>

      <DatePicker
        className="w-100"
        selected={checkInDate}
        onChange={onChange}
        startDate={checkInDate}
        endDate={checkOutDate}
        minDate={new Date()}
        excludeDates={excludeDates}
        selectsRange
        inline
      />

      {isAvailable === true && (
        <div className="alert alert-success my-3">
          {t("booking.available")}
        </div>
      )}
      {isAvailable === false && (
        <div className="alert alert-danger my-3">
          {t("booking.not_available")}
        </div>
      )}

      <button className=" py-3 form-btn w-100" onClick={bookRoom}>
        {t("booking.pay")}
      </button>
    </div>
  );
};

export default BookingDatePicker;

