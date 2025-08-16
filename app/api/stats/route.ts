import { NextResponse } from "next/server";
import Chatroom from "@/models/Chatroom";
import User from "@/models/User";
import { connectDB } from "@/utils/connectDB";

export async function GET() {
  try {
    await connectDB();

    const [totalUsers, totalChatrooms] = await Promise.all([
      User.countDocuments(),
      Chatroom.countDocuments(),
    ]);

    // This is a simplified example - in a real app you might track active chats differently
    const activeChats = Math.floor(totalChatrooms * 0.7); // Example: 70% of chatrooms are active

    return NextResponse.json({
      totalUsers,
      totalChatrooms,
      activeChats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
