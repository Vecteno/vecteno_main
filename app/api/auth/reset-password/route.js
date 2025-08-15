import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import userModel from "@/app/models/userModel";
import connectToDatabase from "@/lib/db";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    console.log("BODY:", body);

    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      console.log("❌ Missing credentials");
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 }
      );
    }

    const user = await userModel.findOne({ email });
    console.log("User from DB:", user); // add this
    if (!user) {
      console.log("❌ User not found");
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if OTP exists
    if (!user.resetOtp) {
      console.log("❌ No reset OTP found");
      return NextResponse.json(
        { success: false, message: "No reset OTP found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (user.resetOtpExpireAt && user.resetOtpExpireAt < Date.now()) {
      console.log("❌ OTP Expired");
      // Clear expired OTP
      user.resetOtp = undefined;
      user.resetOtpExpireAt = undefined;
      await user.save();
      
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (String(user.resetOtp) !== String(otp)) {
      console.log("Stored OTP:", user.resetOtp, typeof user.resetOtp);
      console.log("Input OTP :", otp, typeof otp);

      return NextResponse.json(
        { success: false, message: "Invalid OTP. Please check and try again." },
        { status: 400 }
      );
    }

    // All good - hash password and clear OTP
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpireAt = undefined;
    await user.save();

    console.log("✅ Password reset successful");
    return NextResponse.json(
      { success: true, message: "Password has been reset" },
      { status: 200 }
    );
  } catch (err) {
    console.error("🔥 Error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
