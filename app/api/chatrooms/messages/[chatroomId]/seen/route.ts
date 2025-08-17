// api/chatrooms/messages/[chatroomId]/seen
import Chatroom from "@/models/Chatroom";
import Message from "@/models/Message";
import User from "@/models/User";
import { connectDB } from "@/utils/connectDB";
import { verifyToken } from "@/utils/Token";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
// Extract chatroomId from the URL (second to last segment)
const pathSegments = req.nextUrl.pathname.split("/");
const chatroomId = pathSegments[pathSegments.length - 2];

  try {
    connectDB();
    // Verify the logged-in user from the token
    const loggedInUser = await verifyToken(req);
    if (!loggedInUser.email) {
      return NextResponse.json(
        { success: false, message: "Login Required." },
        { status: 401 }
      );
    }

    const [chatroom, user] = await Promise.all([
      Chatroom.findOne({
        _id: new mongoose.Types.ObjectId(chatroomId),
      }),
      User.findOne({ email: loggedInUser.email }),
    ]);

    if (!chatroom) {
      return NextResponse.json(
        {
          success: false,
          message: "ChatRoom not exists.",
        },
        { status: 404 }
      );
    }
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }
    // Check if the user is a member of the chatroom
    if (!chatroom.users.includes(user._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not a member of this chatroom.",
        },
        { status: 403 }
      );
    }
    // Mark all the message seen in this chatroom which is not sent by the current Users
    await Message.updateMany(
      {
        chatroom: chatroom._id,
        seen: false,
        sender: { $ne: user._id },
      },
      { $set: { seen: true } }
    );

    return NextResponse.json({
      success: true,
      message: "Messages marked as seen.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
