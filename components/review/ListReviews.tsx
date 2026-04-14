import { IReview } from "@/backend/models/room";
import React, { useState } from "react";
import StarRatings from "react-star-ratings";

interface Props {
  reviews: IReview[]
}

const ListReviews = ({ reviews }: Props) => {
  const [expanded, setExpanded] = useState(false);

  // Determine which reviews to display
  const displayedReviews = expanded ? reviews : reviews?.slice(0, 5);
  const hasMore = reviews?.length > 5;

  return (
    <div className="reviews w-75 mb-5">
      <h3 className="mb-4">
        {reviews?.length} Reviews 
        {reviews?.length > 0 && (
           <span className="ms-2 fs-6 text-muted">
             (Showing {displayedReviews.length} of {reviews.length})
           </span>
        )}
      </h3>
      <hr />

      {displayedReviews?.map((review) => (
        <div className="review-card my-3" key={review?._id as string}>
          <div className="row">
            <div className="col-3 col-lg-1">
              <img
                src={review?.user?.avatar ? review?.user?.avatar?.url : "/images/default_avatar.jpg"}
                alt={review?.user?.name}
                width={60}
                height={60}
                className="rounded-circle shadow-sm border"
              />
            </div>
            <div className="col-9 col-lg-11">
              <StarRatings
                rating={review?.rating}
                starRatedColor="#e61e4d"
                numberOfStars={5}
                starDimension="18px"
                starSpacing="1px"
                name="rating"
              />
              <p className="review_user mt-1 mb-1 fw-bold">by {review?.user?.name || "Guest"}</p>
              <p className="review_comment text-muted">
                {review?.comment}
              </p>
            </div>
            <hr className="mt-3 opacity-25" />
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="text-center mt-4">
          <button 
            className="btn btn-outline-danger px-5 py-2 rounded-pill shadow-sm"
            onClick={() => setExpanded(!expanded)}
            style={{
              transition: "all 0.3s ease",
              fontWeight: "600",
              fontSize: "0.9rem"
            }}
          >
            {expanded ? "Show Less" : `See All ${reviews.length} Reviews`}
          </button>
        </div>
      )}

      {(!reviews || reviews.length === 0) && (
        <p className="text-muted">No reviews yet for this room.</p>
      )}
    </div>
  );
};

export default ListReviews;
