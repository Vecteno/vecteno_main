import adminModel from "@/app/models/adminUserModel";
import connectToDatabase from "@/lib/db";
import { generateJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectToDatabase();
    console.log("Connected to Database (Admin)");
    const { email, password } = await request.json();
    console.log("Received Data:", { email, password });
    const adminExist = await adminModel.findOne({ email });

    if (!adminExist) {
      return NextResponse.json({ error: "User Not Found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, adminExist.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid Password", status: 400 });
    }

    // Check if 2FA is enabled globally (if any admin has 2FA enabled, all need it)
    const anyAdmin2FAEnabled = await adminModel.findOne({ twoFactorEnabled: true });
    
    if (anyAdmin2FAEnabled) {
      console.log(`🔐 Global 2FA is enabled (found admin with 2FA: ${anyAdmin2FAEnabled.email}), OTP required for ${email}`);
      console.log(`📊 Current admin 2FA status:`, adminExist.twoFactorEnabled);
      console.log(`📊 Global 2FA enforced: true`);
      return NextResponse.json({ 
        message: "2FA Required", 
        requiresOTP: true,
        email: email,
        status: 200 
      });
    }

    // If 2FA is not enabled, proceed with normal login
    const token = await generateJWT({ id: adminExist._id.toString(), role: "admin" });
    
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return NextResponse.json({ 
        message: "Login Successful", 
        token: token,
        status: 200 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message, status: 500 });
  }
}
