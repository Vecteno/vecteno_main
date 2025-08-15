import { NextResponse } from "next/server";
import userModel from "@/app/models/userModel";
import connectToDatabase from "@/lib/db";
import bcrypt from "bcrypt";
import { generateJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    await connectToDatabase();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return NextResponse.json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check if OTP is valid and not expired
    if (user.emailVerificationOtp !== otp) {
      return NextResponse.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (Date.now() > user.emailVerificationOtpExpireAt) {
      return NextResponse.json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Hash password if it's not already hashed
    let hashedPassword = user.password;
    if (user.password && !user.password.startsWith('$2b$')) {
      hashedPassword = await bcrypt.hash(user.password, 10);
    }

    // Verify the user
    user.isEmailVerified = true;
    user.password = hashedPassword;
    user.emailVerificationOtp = "";
    user.emailVerificationOtpExpireAt = null;
    await user.save();

    // Generate JWT token for auto-login
    const token = await generateJWT({ 
      id: user._id.toString(), 
      role: "user" 
    });

    // Set the token as HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      autoLogin: true,
    });
  } catch (error) {
    console.error("Verify signup OTP error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to verify OTP",
    });
  }
}
