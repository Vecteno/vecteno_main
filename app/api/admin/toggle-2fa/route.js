import { NextResponse } from "next/server";
import adminUserModel from "@/app/models/adminUserModel";
import connectToDatabase from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

export async function POST(req) {
  try {
    await connectToDatabase();

    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token received for 2FA toggle:', token ? 'Present' : 'Missing');
    
    let decoded;
    try {
      decoded = await verifyJWT(token);
      console.log('Token decoded successfully:', decoded);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }
    
    if (!decoded || decoded.role !== 'admin') {
      console.error('Invalid role or decoded data:', decoded);
      return NextResponse.json(
        { success: false, message: "Invalid admin token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { twoFactorEnabled } = body;

    // Find and update admin
    const admin = await adminUserModel.findById(decoded.id);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Update 2FA setting
    console.log(`🔄 Updating 2FA from ${admin.twoFactorEnabled} to ${twoFactorEnabled} for admin: ${admin.email}`);
    
    admin.twoFactorEnabled = twoFactorEnabled;
    const savedAdmin = await admin.save();
    
    console.log(`✅ 2FA ${twoFactorEnabled ? 'enabled' : 'disabled'} for admin: ${admin.email}`);
    console.log(`📄 Saved admin 2FA status:`, savedAdmin.twoFactorEnabled);
    
    // Verify the save was successful by re-fetching
    const verifyAdmin = await adminUserModel.findById(decoded.id);
    console.log(`🔍 Verification: Admin 2FA status in DB:`, verifyAdmin.twoFactorEnabled);
    
    return NextResponse.json({
      success: true,
      message: `Two-factor authentication ${twoFactorEnabled ? 'enabled' : 'disabled'} successfully`,
      twoFactorEnabled: verifyAdmin.twoFactorEnabled
    });

  } catch (error) {
    console.error("🔥 Error toggling 2FA:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
