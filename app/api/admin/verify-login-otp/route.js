import { NextResponse } from "next/server";
import adminUserModel from "@/app/models/adminUserModel";
import connectToDatabase from "@/lib/db";
import { generateJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find admin
    const admin = await adminUserModel.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Check if login OTP exists
    if (!admin.loginOtp) {
      return NextResponse.json(
        { success: false, message: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (admin.loginOtpExpireAt && admin.loginOtpExpireAt < Date.now()) {
      // Clear expired OTP
      admin.loginOtp = undefined;
      admin.loginOtpExpireAt = undefined;
      await admin.save();
      
      return NextResponse.json(
        { success: false, message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (String(admin.loginOtp) !== String(otp)) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // Clear login OTP after successful verification
    admin.loginOtp = undefined;
    admin.loginOtpExpireAt = undefined;
    await admin.save();

    // Generate JWT token
    const token = await generateJWT({ id: admin._id.toString(), role: "admin" });
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log(`✅ Admin login completed with 2FA: ${email}`);
    
    return NextResponse.json({ 
        success: true,
        message: "Login successful", 
        token: token
    });

  } catch (error) {
    console.error("🔥 Error verifying login OTP:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to verify code" },
      { status: 500 }
    );
  }
}
