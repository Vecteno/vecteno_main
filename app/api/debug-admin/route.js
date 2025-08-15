import { NextResponse } from "next/server";
import adminUserModel from "@/app/models/adminUserModel";
import connectToDatabase from "@/lib/db";

export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Get all admins to debug
    const admins = await adminUserModel.find({});
    
    console.log("🔍 All admins in database:", admins);
    
    return NextResponse.json({
      success: true,
      admins: admins.map(admin => ({
        email: admin.email,
        name: admin.name,
        resetOtp: admin.resetOtp,
        resetOtpExpireAt: admin.resetOtpExpireAt,
        hasOtp: !!admin.resetOtp
      }))
    });
    
  } catch (error) {
    console.error("🔥 Debug error:", error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
