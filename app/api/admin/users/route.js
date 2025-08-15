import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import adminModel from "@/app/models/adminUserModel";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch regular users
    const regularUsers = await userModel.find().select("-password");
    
    // Fetch admins and format them to match user structure
    const admins = await adminModel.find().select("-password");
    const formattedAdmins = admins.map(admin => ({
      _id: admin._id,
      name: admin.name || "Admin",
      email: admin.email,
      role: "admin",
      isPremium: true, // Admins are considered premium
      isAdmin: true, // Add flag to identify admins
      createdAt: admin.createdAt,
      twoFactorEnabled: admin.twoFactorEnabled || false
    }));
    
    // Combine users and admins
    const allUsers = [...regularUsers, ...formattedAdmins];
    
    return NextResponse.json({ success: true, users: allUsers });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
