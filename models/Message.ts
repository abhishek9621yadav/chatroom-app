import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  roomId: mongoose.Types.ObjectId; // Reference to Room
  sender: mongoose.Types.ObjectId; // Sender's User ID
  type: "text" | "file" | "system";
  fileUrl: string;
  fileName: string;
  fileSize: string;
  content: string; // Message content
  isDelete: boolean;
  timestamp: Date; // Timestamp of when message was sent
}

const MessageSchema = new Schema<IMessage>({
  roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["text", "file", "system"], default: "text" },
  fileUrl: { type: String, required: false },
  fileName: { type: String, required: false },
  fileSize: { type: String, required: false },
  content: { type: String, required: true, minlength: 1, maxlength: 2000 },
  isDelete: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
