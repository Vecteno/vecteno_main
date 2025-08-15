import adminModel from "@/app/models/adminUserModel";
import connectToDatabase from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    await connectToDatabase();
    console.log("Connected to Database");

    // Find the admin user
    const adminUser = await adminModel.findOne({ email: "admin@gmail.com" });
    
    if (!adminUser) {
      return NextResponse.json({ 
        error: "Admin user not found",
        status: 404 
      });
    }

    // Check if password is already hashed (bcrypt hashes start with $2b$)
    if (adminUser.password.startsWith('$2b$')) {
      return NextResponse.json({ 
        message: "Admin password is already properly hashed",
        status: 200 
      });
    }

    // Hash the current password if it's plain text
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    
    // Update the admin user with hashed password
    adminUser.password = hashedPassword;
    await adminUser.save();
    
    return NextResponse.json({ 
      message: "✅ Admin password has been fixed and hashed successfully!",
      status: 200 
    });
    
  } catch (error) {
    console.error("❌ Error fixing admin password:", error.message);
    return NextResponse.json({ 
      error: error.message, 
      status: 500 
    });
  }
}
