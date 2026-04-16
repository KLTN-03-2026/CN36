import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user";

export interface ILog extends Document {
  user: IUser;
  action: string;
  target: string;
  details: string;
  createdAt: Date;
}

const logSchema: Schema<ILog> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Log || mongoose.model<ILog>("Log", logSchema);
