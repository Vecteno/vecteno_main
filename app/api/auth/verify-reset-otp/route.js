import { NextResponse } from "next/server";
import userModel from "@/app/models/userModel";
import connectToDatabase from "@/lib/db";

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP exists
    if (!user.resetOtp) {
      return NextResponse.json({
        success: false,
        message: "No reset OTP found. Please request a new one.",
      });
    }

    // Check if OTP is expired
    if (user.resetOtpExpireAt && user.resetOtpExpireAt < Date.now()) {
      // Clear expired OTP
      user.resetOtp = undefined;
      user.resetOtpExpireAt = undefined;
      await user.save();
      
      return NextResponse.json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Check if OTP matches
    if (user.resetOtp !== otp) {
      return NextResponse.json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      });
    }

    // OTP is valid - don't clear it yet, as we need it for password reset
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("Error verifying reset OTP:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error. Please try again.",
    });
  }
}
