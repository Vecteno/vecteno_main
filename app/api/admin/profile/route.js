import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import connectToDatabase from "@/lib/db";
import AdminModel from "@/app/models/adminUserModel";

// GET - Fetch admin profile
export const GET = async (req) => {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication token required" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = await verifyJWT(token);
      console.log('Profile API - Token verified:', decoded);
    } catch (error) {
      console.error('Profile API - Token verification failed:', error.message);
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Find admin by ID from token
    const admin = await AdminModel.findById(decoded.id).select("-password");
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role || "admin",
        twoFactorEnabled: admin.twoFactorEnabled || false,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    
    if (error.message?.includes('JWS') || error.message?.includes('token')) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
};

// PUT - Update admin profile
export const PUT = async (req) => {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication token required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyJWT(token);
    
    const { name, email } = await req.json();
    
    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Check if email is already taken by another admin
    const existingAdmin = await AdminModel.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: decoded.id }
    });
    
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: "Email is already taken" },
        { status: 400 }
      );
    }
    
    // Update admin profile
    const updatedAdmin = await AdminModel.findByIdAndUpdate(
      decoded.id,
      {
        name: name.trim(),
        email: email.toLowerCase().trim()
      },
      { new: true, select: "-password" }
    );
    
    if (!updatedAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role || "admin",
        twoFactorEnabled: updatedAdmin.twoFactorEnabled || false,
        createdAt: updatedAdmin.createdAt
      }
    });

  } catch (error) {
    console.error("Profile update error:", error);
    
    if (error.message?.includes('JWS') || error.message?.includes('token')) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
};
