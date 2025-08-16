import mongoose, { Schema, Document } from "mongoose";

interface IRoom extends Document {
  name: string;
  description: string;
  users: mongoose.Types.ObjectId[]; // Array of user IDs
  isPrivate: boolean; // Whether room is private or public
  password: string;
  slug: string;
  createdBy: mongoose.Types.ObjectId; // User who created the room
  maxMembers: number;
  createdAt: Date; // Timestamp for room creation
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }], // Users in the room
    isPrivate: { type: Boolean, default: false }, // Room privacy
    password: { type: String },
    slug: { type: String },
    maxMembers: { type: Number, default: 50 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Room ||
  mongoose.model<IRoom>("Room", RoomSchema);
