import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import adminModel from "@/app/models/adminUserModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectToDatabase();

    // Get and verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No valid token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let adminId;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      adminId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Verify admin exists
    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin not found" },
        { status: 401 }
      );
    }

    // Get request body
    const { name, email, password, role, isPremium } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user/admin already exists
    const existingUser = await userModel.findOne({ email });
    const existingAdmin = await adminModel.findOne({ email });
    
    if (existingUser || existingAdmin) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let newUser;

    if (role === 'admin') {
      // Create admin
      newUser = new adminModel({
        name: name || "Admin",
        email,
        password: hashedPassword,
        role: 'admin'
      });
    } else {
      // Create regular user
      newUser = new userModel({
        name: name || "",
        email,
        password: hashedPassword,
        isPremium: isPremium || false
      });
    }

    await newUser.save();

    // Return user data without password
    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isPremium: newUser.isPremium,
      isAdmin: role === 'admin' ? true : false,
      role: role === 'admin' ? 'admin' : 'user',
      createdAt: newUser.createdAt
    };

    return NextResponse.json({
      success: true,
      message: `${role === 'admin' ? 'Admin' : 'User'} created successfully`,
      user: userData
    });

  } catch (error) {
    console.error("Add user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
