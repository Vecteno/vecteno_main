import { NextResponse } from "next/server";
import adminUserModel from "@/app/models/adminUserModel";
import connectToDatabase from "@/lib/db";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    console.log("BODY:", body);

    const { email, otp } = body;

    if (!email || !otp) {
      console.log("❌ Missing email or OTP");
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await adminUserModel.findOne({ email });
    console.log("Admin from DB:", admin ? "Found" : "Not found");
    
    // Debug: Show admin data
    if (admin) {
      console.log("📋 Admin data:", {
        email: admin.email,
        resetOtp: admin.resetOtp,
        resetOtpExpireAt: admin.resetOtpExpireAt,
        hasOtp: !!admin.resetOtp,
        currentTime: Date.now(),
        expireDate: admin.resetOtpExpireAt ? new Date(admin.resetOtpExpireAt) : null
      });
    }
    
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
      console.log("Input OTP:", otp, typeof otp);

      return NextResponse.json(
        { success: false, message: "Invalid OTP. Please check and try again." },
        { status: 400 }
      );
    }

    console.log("✅ OTP verification successful");
    return NextResponse.json(
      { 
        success: true, 
        message: "OTP verified successfully. You can now reset your password." 
      },
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
