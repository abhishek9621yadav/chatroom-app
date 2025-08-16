// app/api/auth/signup/route.ts
import User from "@/models/User";
import { connectDB } from "@/utils/connectDB";
import { HashPassword } from "@/utils/hashPassword";
import { generateToken } from "@/utils/Token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  connectDB();

  try {
    const { username, email, name, password, avatarUrl } = await req.json();

    if (!username || !email || !name || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }
    const exisitingUser = await User.findOne({ username });
    if (exisitingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already taken",
        },
        { status: 400 }
      );
    }
    const exisitingEmail = await User.findOne({ email });
    if (exisitingEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already used",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await HashPassword(password);
    const user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      avatarUrl: avatarUrl ? avatarUrl : "",
    });
    const token = generateToken({ email, name, username });

    return NextResponse.json({
      message: "User Created Succesfully",
      success: true,
      user: user,
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
