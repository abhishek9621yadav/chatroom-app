import Chatroom from "@/models/Chatroom";
import User from "@/models/User";
import Message from "@/models/Message"; // Assuming you have a Message model to fetch messages
import { connectDB } from "@/utils/connectDB";
import { verifyToken } from "@/utils/Token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  connectDB();
  try {
    // Verify the logged-in user from the token
    const loggedInUser = await verifyToken(req);
    if (!loggedInUser.email) {
      return NextResponse.json(
        { success: false, message: "Login Required." },
        { status: 401 } // Unauthorized status code
      );
    }

    const name = req.nextUrl.searchParams.get("name");
    const isPrivate = req.nextUrl.searchParams.get("isPrivate");
    const limit = req.nextUrl.searchParams.get("limit") || 10;
    const skip = req.nextUrl.searchParams.get("skip") || 0;

    const user = await User.findOne({ email: loggedInUser.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 } // Not Found status code
      );
    }

    // Build the filter query object to find all the chatrooms in which the user is a member
    let filter: any = {
      users: user._id,
    };

    if (isPrivate) {
      filter.isPrivate = isPrivate === "true";
    }
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // Fetch all chatrooms with the specified filters and pagination
    const chatrooms = await Chatroom.find(filter)
      .skip(Number(skip))
      .limit(Number(limit))
      .populate("users", "name username") // Populate the users field
      .populate("createdBy", "name username") // Populate the creator's info
      .exec();

    // For each chatroom, calculate the last message and unread count
    const chatroomsWithAdditionalInfo = await Promise.all(
      chatrooms.map(async (chatroom) => {
        const lastMessage = await Message.findOne({ roomId: chatroom._id })
          .sort({ timestamp: -1 }) // Get the most recent message
          .populate("sender", "name username")
          .exec();

        const unreadCount = await Message.countDocuments({
          roomId: chatroom._id,
          isDeleted: false,
          isPinned: false,
          isEdited: false,
          seenBy: { $nin: [user._id] }, // user has not seen
          sender: { $ne: user._id },    // user is not the sender
        });

        return {
          _id: chatroom._id,
          name: chatroom.name,
          description: chatroom.description,
          users: chatroom.users,
          isPrivate: chatroom.isPrivate,
          createdBy: chatroom.createdBy,
          maxMembers: chatroom.maxMembers,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                timestamp: lastMessage.timestamp,
                sender: {
                  name: lastMessage.sender.name,
                  username: lastMessage.sender.username,
                },
              }
            : undefined,
          unreadCount: unreadCount,
        };
      })
    );

    // Return the fetched chatrooms with additional info
    return NextResponse.json({
      success: true,
      chatrooms: chatroomsWithAdditionalInfo,
    });
  } catch (error: any) {
    console.error("Error fetching chatrooms:", error.message); // Log more detailed error info
    return NextResponse.json(
      { message: "An error occurred", success: false, error: error.message },
      { status: 500 }
    );
  }
}
