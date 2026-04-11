"use client";

import { IRoom } from "@/backend/models/room";
import React, { useEffect, useRef } from "react";
import StarRatings from "react-star-ratings";
import RoomImageSlider from "./RoomImageSlider";
import RoomFeatures from "./RoomFeatures";
import BookingDatePicker from "./BookingDatePicker";
import ListReviews from "../review/ListReviews";
import NewReview from "../review/NewReview";
import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import type { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Props {
  data: {
    room: IRoom;
  };
}



const RoomDetails = ({ data }: Props) => {
  const { room } = data;

  const mapRef = useRef<MapboxMap | null>(null);

  useEffect(() => {
    if (!room?.location) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error("Mapbox access token is missing!");
      return;
    }

    mapboxgl.accessToken = token;

    const coordinates = room.location.coordinates as [number, number];

    if (mapRef.current) {
      mapRef.current.remove();
    }

    mapRef.current = new mapboxgl.Map({
      container: "room-map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: coordinates,
      zoom: 12,
    });

    // Add marker to the map
    new mapboxgl.Marker().setLngLat(coordinates).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
    };
  }, [room]);

  return (
    <div className="container container-fluid">
      <h2 className="mt-5">{room.name}</h2>
      <p>{room.address}</p>

      <div className="ratings mt-auto mb-3">
        <StarRatings
          rating={room?.ratings}
          starRatedColor="#e61e4d"
          numberOfStars={5}
          starDimension="22px"
          starSpacing="1px"
          name="rating"
        />
        <span className="no-of-reviews">({room?.numOfReviews} Reviews)</span>
      </div>
      <RoomImageSlider images={room?.images} />

      <div className="row my-5">
        <div className="col-12 col-md-6 col-lg-8">
          <h3>Description</h3>
          <p>{room?.description}</p>

          <RoomFeatures room={room} />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <BookingDatePicker room={room} />

          {room?.location && (
            <div className="my-5">
              <h4 className="my-2">Room Location:</h4>
              <div
                id="room-map"
                className="shadow rounded"
                style={{ height: 350, width: "100%" }}
              ></div>
            </div>
          )}
        </div>
      </div>

      <NewReview roomId={room._id} />
      <ListReviews reviews={room?.reviews} />
    </div>
  );
};

export default RoomDetails;
