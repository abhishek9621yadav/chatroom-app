import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  name: string;
  password: string;
  avatarUrl?: string; // Optional field for user profile image
  online: boolean; // Tracks user presence
  createdAt: Date; // Timestamp for account creation
  updatedAt: Date; // Timestamp for last update
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
    },
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: "" }, // URL to the user's avatar image
    online: { type: Boolean, default: false }, // Whether the user is currently online
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
