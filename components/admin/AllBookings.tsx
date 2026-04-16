"use client";

import { env } from "process";
import { IBooking } from "@/backend/models/booking";
import { useDeleteBookingMutation } from "@/redux/api/bookingApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "react-hot-toast";

import dynamic from "next/dynamic";
const MDBDataTable = dynamic(
    () => import("mdbreact").then((mod) => mod.MDBDataTable),
    { ssr: false }
);

interface Props {
    data: {
        bookings: IBooking[];
    };
}

const AllBookings = ({ data }: Props) => {
    const bookings = data?.bookings;
    const router = useRouter();

    const [deleteBooking, { error, isSuccess, isLoading }] =
        useDeleteBookingMutation();

    useEffect(() => {
        if (error && "data" in error) {
            toast.error(error?.data?.errMessage);
        }

        if (isSuccess) {
            router.refresh();
            toast.success("Booking deleted");
        }
    }, [error, isSuccess]);

    const setBookings = () => {
        const data: { columns: any[]; rows: any[] } = {
            columns: [
                {
                    label: "ID",
                    field: "id",
                    sort: "asc",
                },
                {
                    label: "Check In",
                    field: "checkIn",
                    sort: "asc",
                },
                {
                    label: "Check Out",
                    field: "checkOut",
                    sort: "asc",
                },
                {
                    label: "Amount Paid",
                    field: "amountPaid",
                    sort: "asc",
                },
                {
                    label: "Actions",
                    field: "actions",
                    sort: "asc",
                },
            ],
            rows: [],
        };

        bookings?.forEach((booking) => {
            data?.rows?.push({
                id: booking._id,
                checkIn: new Date(booking.checkInDate).toLocaleString("en-US"),
                checkOut: new Date(booking.checkOutDate).toLocaleString("en-US"),
                amountPaid: `${booking.amountPaid} VND`,
                actions: (
                    <>
                        <Link
                            href={`/bookings/${booking._id}`}
                            className="btn btn-outline-primary"
                        >
                            {" "}
                            <i className="fa fa-eye"></i>{" "}
                        </Link>
                        <Link
                            href={`/bookings/invoice/${booking._id}`}
                            className="btn btn-outline-success ms-2"
                        >
                            {" "}
                            <i className="fa fa-receipt"></i>{" "}
                        </Link>
                        <button
                            className="btn btn-outline-danger ms-2"
                            onClick={() => deleteBookingHandler(booking._id)}
                            disabled={isLoading}
                        >
                            {" "}
                            <i className="fa fa-trash"></i>{" "}
                        </button>
                    </>
                ),
            });
        });

        return data;
    };

    const deleteBookingHandler = (id: string) => {
        deleteBooking(id);
    };

    return (
        <div className="container">
            <h1 className="my-5">{`${bookings?.length} Bookings`}</h1>
            <MDBDataTable
                data={setBookings()}
                className="px-3"
                bordered
                striped
                hover
            />
        </div>
    );
};

export default AllBookings;
