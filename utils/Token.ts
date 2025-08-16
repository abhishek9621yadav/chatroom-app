import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface CustomJwtPayload extends JwtPayload {
  name: string;
  email: string;
  username: string;
}
const defaultValue = {
  email: "",
  name: "",
  username: "",
};
// Verify Token Middleware
export async function verifyToken(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split(" ")[1]; // Get token from Authorization header

  if (!token) {
    console.log("TOken not found...");
    return defaultValue;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT Secret is not defined...");

  try {
    const decoded = jwt.verify(token, secret) as CustomJwtPayload;
    // return decoded; // Returns the decoded payload (e.g., userId, username, etc.)
    const { email, name, username } = decoded;
    return { name, email, username };
  } catch (error) {
    console.log(error);
    return defaultValue;
  }
}

// Generate Token Function
export function generateToken({
  name,
  email,
  username,
}: {
  name: string;
  email: string;
  username: string;
}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT Secret is not defined");

  const payload = {
    name,
    email,
    username,
  };

  const expiresIn = "7d";

  // Create the JWT token
  const token = jwt.sign(payload, secret, { expiresIn });

  return token;
}
