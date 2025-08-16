// /api/chatrooms
import Chatroom from "@/models/Chatroom";
import User from "@/models/User";
import { connectDB } from "@/utils/connectDB";
import { HashPassword } from "@/utils/hashPassword";
import { verifyToken } from "@/utils/Token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
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

    // Destructure request body
    const { name, description, isPrivate, password, maxMembers } =
      await req.json();

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: "Name and Description are required." },
        { status: 400 } // Bad Request
      );
    }

    // Check for private chatroom password requirement
    if (isPrivate && !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password required while creating Private Chatrooms.",
        },
        { status: 400 }
      );
    }

    // Validate maxMembers
    if (maxMembers) {
      if (isNaN(maxMembers) || maxMembers <= 0) {
        return NextResponse.json(
          { success: false, message: "maxMembers must be a positive number." },
          { status: 400 } // Bad Request
        );
      }
      if (maxMembers > 1025) {
        return NextResponse.json(
          {
            success: false,
            message: "Only 1025 members can be maximum in a chatroom.",
          },
          { status: 400 } // Bad Request
        );
      }
    }

    // Validate user
    const user = await User.findOne({ email: loggedInUser.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Login required" },
        { status: 400 } // Bad Request
      );
    }

    // Hash the password if the chatroom is private
    let hashedPassword = "";
    if (isPrivate && password) {
      hashedPassword = await HashPassword(password); // Ensure this function hashes securely
    }

    // Check if the same user is creating a chatroom with the same name and description
    const isAlreadyCreated = await Chatroom.findOne({
      name,
      description,
      createdBy: user._id,
    });

    if (isAlreadyCreated) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already created a chatroom with the same name and description.",
        },
        { status: 400 } // Bad Request
      );
    }

    if (name.length < 3 || description.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name must be at least 3 characters and description at least 10 characters.",
        },
        { status: 400 } // Bad Request status
      );
    }

    // Create the chatroom
    const chatroom = await Chatroom.create({
      name,
      description,
      isPrivate,
      password: isPrivate ? hashedPassword : "",
      createdBy: user._id,
      users: [user._id],
      maxMembers: maxMembers || 50, // Default to 50 if not provided
    });

    // Return successful response
    return NextResponse.json(
      {
        message: "Chatroom created successfully",
        success: true,
        chatroom,
      },
      { status: 201 }
    ); // Created status code
  } catch (error: any) {
    console.error("Error creating chatroom:", error.message); // Log more detailed error info
    return NextResponse.json(
      { message: "An error occurred", success: false, error: error.message },
      { status: 500 } // Internal Server Error
    );
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
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

    // Build the filter query object
    let filter: any = {}; // Default to no filter, meaning fetch all chatrooms

    if (isPrivate) {
      filter.isPrivate = isPrivate === "true"; // Filter by private chatrooms if specified
    }
    if (name) {
      filter.name = { $regex: name, $options: "i" }; // Filter by chatroom name using a case-insensitive regex search
    }

    // Fetch all chatrooms with the specified filters and pagination
    const chatrooms = await Chatroom.find(filter)
      .skip(Number(skip)) // Pagination: skip the number of records
      .limit(Number(limit)); // Pagination: limit the number of records per request

    // Return the fetched chatrooms
    return NextResponse.json({
      success: true,
      chatrooms,
    });
  } catch (error: any) {
    console.error("Error fetching chatrooms:", error.message); // Log more detailed error info
    return NextResponse.json(
      { message: "An error occurred", success: false, error: error.message },
      { status: 500 } // Internal Server Error
    );
  }
}
