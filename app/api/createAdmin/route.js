import adminModel from "@/app/models/adminUserModel";
import connectToDatabase from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    await connectToDatabase();
    console.log("Connected to Database");

    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({ email: "admin@gmail.com" });
    
    if (existingAdmin) {
      return NextResponse.json({ 
        message: "Admin user already exists with email: admin@gmail.com",
        status: 200 
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash("admin@123", 10);
    
    // Create new admin user
    const newAdmin = new adminModel({
      email: "admin@gmail.com",
      password: hashedPassword
    });

    await newAdmin.save();
    
    return NextResponse.json({ 
      message: "✅ Admin user created successfully!",
      details: {
        email: "admin@gmail.com",
        password: "admin@123",
        name: "pk admin"
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