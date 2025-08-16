import User from "@/models/User";
import { connectDB } from "@/utils/connectDB";
import { VerifyPassword } from "@/utils/hashPassword";
import { generateToken } from "@/utils/Token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  connectDB();

  try {
    const { userid, password } = await req.json();

    if (!userid || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }
    const existingUser = await User.findOne({
      $or: [{ username: userid }, { email: userid }],
    });
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }
    console.log("Existing User:", existingUser);
    console.log("User Password:", password);
    const isValid = await VerifyPassword(password, existingUser.password);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Credentials",
        },
        { status: 400 }
      );
    }

    const token = generateToken({
      email: existingUser.email,
      name: existingUser.name,
      username: existingUser.username,
    });

    return NextResponse.json({
      message: "User LoggedIn succesfully.",
      success: true,
      token,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Some error occured",
        success: false,
      },
      { status: 400 }
    );
  }
}
