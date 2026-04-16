"use client";

import { useDeleteReviewMutation, useLazyGetAdminReviewsQuery } from "@/redux/api/roomApi";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import dynamic from "next/dynamic";
const MDBDataTable = dynamic(
    () => import("mdbreact").then((mod) => mod.MDBDataTable),
    { ssr: false }
);

const RoomReviews = () => {
  const [roomId, setRoomId] = useState("");

  const router = useRouter();

  const [getRoomReviews, { data, error }] = useLazyGetAdminReviewsQuery();

  const [
    deleteReview,
    { error: deleteError, isSuccess, isLoading: isDeleteLoading },
  ] = useDeleteReviewMutation();

  const reviews = data?.reviews || [];

  useEffect(() => {
    if (error && "data" in error) {
      toast.error(error?.data?.errMessage);
    }

    if (deleteError && "data" in deleteError) {
      toast.error(deleteError?.data?.errMessage);
    }

    if (isSuccess) {
      toast.success("Review deleted");
    }
  }, [error, deleteError, isSuccess]);

  const setReviews = () => {
    const data: { columns: any[]; rows: any[] } = {
      columns: [
        {
          label: "ID",
          field: "id",
          sort: "asc",
        },
        {
          label: "Rating",
          field: "rating",
          sort: "asc",
        },
        {
          label: "Comment",
          field: "comment",
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

    reviews?.forEach((review: any) => {
      data?.rows?.push({
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        actions: (
            <button
              className="btn btn-outline-danger ms-2"
              onClick={() => deleteReviewHandler(review._id)}
              disabled={isDeleteLoading}
            >
              {" "}
              <i className="fa fa-trash"></i>{" "}
            </button>
        ),
      });
    });

    return data;
  };

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    getRoomReviews(roomId);
  };

  const deleteReviewHandler = (id: string) => {
    deleteReview({ id, roomId });
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-6">
          <form onSubmit={submitHandler}>
            <div className="mb-3">
              <label htmlFor="roomId_field" className="form-label">
                Enter Room ID
              </label>
              <input
                type="text"
                id="roomId_field"
                className="form-control"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={!roomId}
            >
              Fetch Reviews
            </button>
          </form>
        </div>
      </div>

      {reviews?.length > 0 ? (
           <MDBDataTable
           data={setReviews()}
           className="px-3"
           bordered
           striped
           hover
         />
      ) : (
        <h5 className="mt-5 text-center">No Reviews</h5>
      )}
    </div>
  );
};

export default RoomReviews;
