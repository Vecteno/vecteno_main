import userModel from "@/app/models/userModel";
import connectToDatabase from "@/lib/db";
import { NextResponse } from "next/server";
import { generateJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    await connectToDatabase();
    console.log("Connected to Database");

    const { email, password } = await request.json();
    console.log("Received Data:", { email, password });

    const userExist = await userModel.findOne({ email });
    if (!userExist) {
      return NextResponse.json({ error: "User Not Found", status: 404 });
    }

    // Skip for Google users
    if (!userExist.isGoogleUser && !userExist.isEmailVerified) {
      return NextResponse.json({
        error: "Please verify your email address before logging in",
        needsVerification: true,
        email: userExist.email,
        status: 400
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userExist.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid Password", status: 400 });
    }

    const token = await generateJWT({ id: userExist._id.toString(), role: "user" });
    const cookieStore = await cookies();
    // Always overwrite token cookie
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL?.startsWith("https"),
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    // Optionally, clear other session cookies here if needed
    return NextResponse.json({ message: "Login Successful", status: 200 });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
