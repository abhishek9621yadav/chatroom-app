import User from "@/models/User";
import { connectDB } from "@/utils/connectDB";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  connectDB();
  try {
    const user = await User.create({
      name: "Rohit",
      email: "rohitkuyada@gmail.com",
      username: "rohit",
    });

    return NextResponse.json({
      message: "Hello, from /hello route.",
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Some error occured",
      success: false,
      error:error,
    });
  }
}
