import { IRoom } from "@/backend/models/room";
import React from "react";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  room: IRoom;
}

const RoomFeatures = ({ room }: Props) => {
  const { t } = useLanguage();

  return (
    <div className="features mt-5">
      <h3 className="mb-4">{t("room.features")}:</h3>
      <div className="room-feature">
        <i className="fa fa-cog fa-fw fa-users" aria-hidden="true"></i>
        <p>
          {room?.guestCapacity} {t("room.guests_label")}
        </p>
      </div>
      <div className="room-feature">
        <i className="fa fa-cog fa-fw fa-bed" aria-hidden="true"></i>
        <p>
          {room?.numOfBeds} {t("room.beds_label")}
        </p>
      </div>
      <div className="room-feature">
        <i
          className={
            room?.isBreakfast
              ? "fa fa-check text-success"
              : "fa fa-times text-danger"
          }
          aria-hidden="true"
        ></i>
        <p>{t("room.breakfast")}</p>
      </div>
      <div className="room-feature">
        <i
          className={
            room?.isInternet
              ? "fa fa-check text-success"
              : "fa fa-times text-danger"
          }
          aria-hidden="true"
        ></i>
        <p>{t("room.internet")}</p>
      </div>
      <div className="room-feature">
        <i
          className={
            room?.isAirConditioned
              ? "fa fa-check text-success"
              : "fa fa-times text-danger"
          }
          aria-hidden="true"
        ></i>
        <p>{t("room.air_conditioned")}</p>
      </div>
      <div className="room-feature">
        <i
          className={
            room?.isPetsAllowed
              ? "fa fa-check text-success"
              : "fa fa-times text-danger"
          }
          aria-hidden="true"
        ></i>
        <p>{t("room.pets_allowed")}</p>
      </div>
      <div className="room-feature">
        <i
          className={
            room?.isRoomCleaning
              ? "fa fa-check text-success"
              : "fa fa-times text-danger"
          }
          aria-hidden="true"
        ></i>
        <p>{t("room.room_cleaning")}</p>
      </div>
    </div>
  );
};

export default RoomFeatures;

