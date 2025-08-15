import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import adminUserModel from "@/app/models/adminUserModel";
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

    const admin = await adminUserModel.findOne({ email });
    console.log("Admin from DB:", admin ? "Found" : "Not found");
    
    if (!admin) {
      console.log("❌ Admin not found");
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Check if OTP exists
    if (!admin.resetOtp) {
      console.log("❌ No reset OTP found");
      return NextResponse.json(
        { success: false, message: "No reset OTP found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (admin.resetOtpExpireAt && admin.resetOtpExpireAt < Date.now()) {
      console.log("❌ OTP Expired");
      // Clear expired OTP
      admin.resetOtp = undefined;
      admin.resetOtpExpireAt = undefined;
      await admin.save();
      
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (String(admin.resetOtp) !== String(otp)) {
      console.log("Stored OTP:", admin.resetOtp, typeof admin.resetOtp);
      console.log("Input OTP :", otp, typeof otp);

      return NextResponse.json(
        { success: false, message: "Invalid OTP. Please check and try again." },
        { status: 400 }
      );
    }

    // All good - hash password and clear OTP
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    admin.resetOtp = undefined;
    admin.resetOtpExpireAt = undefined;
    await admin.save();

    console.log("✅ Admin password reset successful");
    return NextResponse.json(
      { success: true, message: "Admin password has been reset successfully" },
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
