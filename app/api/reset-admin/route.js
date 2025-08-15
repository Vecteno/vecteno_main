import adminModel from "@/app/models/adminUserModel";
import connectToDatabase from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    await connectToDatabase();
    console.log("Connected to Database");

    // Delete existing admin
    await adminModel.deleteMany({ email: "admin@gmail.com" });
    console.log("Existing admin deleted");

    // Hash the password properly
    const hashedPassword = await bcrypt.hash("admin@123", 10);
    console.log("Password hashed successfully");
    
    // Create new admin user with hashed password
    const newAdmin = new adminModel({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      twoFactorEnabled: false
    });

    await newAdmin.save();
    console.log("New admin created successfully");
    
    return NextResponse.json({ 
      message: "✅ Admin user reset successfully!",
      details: {
        email: "admin@gmail.com",
        password: "admin@123 (hashed)",
        name: "Admin",
        twoFactorEnabled: false
      },
      status: 201 
    });
    
  } catch (error) {
    console.error("❌ Error resetting admin user:", error.message);
    return NextResponse.json({ 
      error: error.message, 
      status: 500 
    }, { status: 500 });
  }
}
