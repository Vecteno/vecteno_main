import adminModel from "@/app/models/adminUserModel";
import connectToDatabase from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    await connectToDatabase();
    console.log("Connected to Database");

    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({ email: "vecteoninda@gmail.com" });
    
    if (existingAdmin) {
      return NextResponse.json({ 
        message: "Admin user already exists with email: vecteoninda@gmail.com",
        status: 200 
      });
    }

    // Create new admin user with hashed password
    const hashedPassword = await bcrypt.hash("admin@123", 10);
    const newAdmin = new adminModel({
      name: "Vecteon Admin",
      email: "vecteoninda@gmail.com",
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();
    
    return NextResponse.json({ 
      message: "✅ Vecteon Admin user created successfully!",
      details: {
        email: "vecteoninda@gmail.com",
        name: "Vecteon Admin",
        role: "admin"
      },
      status: 201 
    });
    
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    return NextResponse.json({ 
      error: error.message, 
      status: 500 
    });
  }
}
