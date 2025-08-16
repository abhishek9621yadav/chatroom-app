import User from "@/models/User";
import { connectDB } from "@/utils/connectDB";
import { verifyToken } from "@/utils/Token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  connectDB();
  try {
    const token = await verifyToken(req);
    const user = await User.findOne({ email: token.email });

    return NextResponse.json({
      message: "User found Succesfully",
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Some error occured",
        success: false,
        error: error,
      },
      { status: 500 }
    );
  }
}
