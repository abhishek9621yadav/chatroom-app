import Chatroom from "@/models/Chatroom";
import Message from "@/models/Message";
import User from "@/models/User";
import { connectDB } from "@/utils/connectDB";
import { verifyToken } from "@/utils/Token";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const chatroomId = req.nextUrl.pathname.split("/").pop();

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

    const { content, type } = await req.json();
    if (!content || !type) {
      return NextResponse.json(
        { success: false, message: "Content and type are required." },
        { status: 400 }
      );
    }

    // Create a new message
    const message = new Message({
      content,
      type,
      chatroom: chatroom._id,
      sender: user._id,
      roomId: chatroom._id,
    });

    await message.save();

    // Update the chatroom's last message and timestamp
    chatroom.lastMessage = {
      content,
      timestamp: new Date(),
      sender: {
        name: user.name,
        username: user.username,
      },
    };
    await chatroom.save();

    const formattedMessage = {
      ...message.toObject(),
      sender: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };

    return NextResponse.json(
      { success: true, message: formattedMessage },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message." },
      { status: 500 }
    );
  }
}

// Get all messages of the chatroom
export async function GET(req: NextRequest) {
  const chatroomId = req.nextUrl.pathname.split("/").pop();

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

    // Fetch all messages of the chatroom
    const messages = await Message.find({ roomId: chatroom._id })
      .populate("sender", "_id name username avatarUrl")
      .sort({ timestamp: 1 });

    return NextResponse.json(
      { success: true, message: "Messages fetched successfully", messages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages." },
      { status: 500 }
    );
  }
}
