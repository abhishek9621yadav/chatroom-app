import Chatroom from "@/models/Chatroom";
import User from "@/models/User";
import { connectDB } from "@/utils/connectDB";
import { VerifyPassword } from "@/utils/hashPassword";
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

    const chatroom = await Chatroom.findOne({
      _id: new mongoose.Types.ObjectId(chatroomId),
    });

    if (!chatroom) {
      return NextResponse.json(
        {
          success: false,
          message: "ChatRoom not exists.",
        },
        { status: 400 }
      );
    }
    if (chatroom.isPrivate) {
      const { password } = await req.json();
      if (!password) {
        return NextResponse.json(
          {
            success: false,
            message: "Password is required to join Private Chatrooms.",
          },
          { status: 400 }
        );
      }
      const isMatched = await VerifyPassword(password, chatroom.password);
      if (!isMatched) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Password.",
          },
          { status: 400 }
        );
      }
    }
    const user = await User.findOne({ email: loggedInUser.email });

    // Check if the user is already in the chatroom
    if (chatroom.users.includes(user._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already a member of this chatroom.",
        },
        { status: 400 }
      );
    }

    // Check if the group is full or not
    
    // Add the user to the chatroom's users array
    chatroom.users.push(user._id);

    // Save the updated chatroom
    await chatroom.save();

    return NextResponse.json(
      {
        success: true,
        message: "Access granted and you have been added to the chatroom.",
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch any errors that might occur
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred.",
      },
      { status: 500 }
    );
  }
}
