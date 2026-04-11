import { IRoom } from "@/backend/models/room";
import React from "react";
import Image from "next/image";
import StarRatings from "react-star-ratings";
import Link from "next/link";

interface Props {
  room: IRoom;
}

const RoomCard = ({ room }: Props) => {
  return (
    <div className="col-sm-12 col-md-6 col-lg-4 col-xl-3 my-3">
      <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
        <div className="position-relative" style={{ height: "200px" }}>
          <Image
            className="img-fluid"
            src={
              room?.images?.length > 0
                ? room.images[0].url
                : "/images/default_room_image.jpg"
            }
            alt={room?.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>

        <div className="card-body d-flex flex-column p-3">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title mb-1 fw-bold" style={{ flex: '1' }}>
              <Link href={`/rooms/${room?._id}`} className="text-dark text-decoration-none stretched-link">
                {room?.name}
              </Link>
            </h5>
            <span className="badge bg-primary rounded-pill ms-2 mt-1">
              ${room?.pricePerNight}
            </span>
          </div>

          <p className="card-text text-muted small">{room?.address}</p>
          
          <div className="d-flex align-items-center mt-auto">
            <StarRatings
              rating={room?.ratings}
              starRatedColor="#FFB400"
              numberOfStars={5}
              starDimension="18px"
              starSpacing="1px"
              name="rating"
            />
            <span className="ms-2 text-muted small">
              ({room?.numOfReviews} Reviews)
            </span>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;