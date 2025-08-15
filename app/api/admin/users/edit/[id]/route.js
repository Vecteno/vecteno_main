import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import adminModel from "@/app/models/adminUserModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function PUT(request, { params }) {
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

    const { id } = params;
    const { name, email, password, role, isPremium } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user/admin to update
    let existingUser = await userModel.findById(id);
    let existingAdmin = await adminModel.findById(id);
    let isCurrentlyAdmin = false;

    if (!existingUser && !existingAdmin) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (existingAdmin) {
      isCurrentlyAdmin = true;
    }

    // Check if email is being changed and already exists
    if (existingUser && existingUser.email !== email) {
      const emailExists = await userModel.findOne({ email, _id: { $ne: id } }) || 
                         await adminModel.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    } else if (existingAdmin && existingAdmin.email !== email) {
      const emailExists = await userModel.findOne({ email, _id: { $ne: id } }) || 
                         await adminModel.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      name: name || "",
      email
    };

    // Hash password if provided
    if (password && password.trim() !== "") {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    let updatedUser;

    // Handle role change
    if (role === 'admin' && !isCurrentlyAdmin) {
      // Convert user to admin
      if (existingUser) {
        // Create new admin
        const newAdmin = new adminModel({
          ...updateData,
          password: updateData.password || existingUser.password,
          role: 'admin'
        });
        
        updatedUser = await newAdmin.save();
        
        // Delete the old user record
        await userModel.findByIdAndDelete(id);
      }
    } else if (role === 'user' && isCurrentlyAdmin) {
      // Convert admin to user
      if (existingAdmin) {
        // Create new user
        const newUser = new userModel({
          ...updateData,
          password: updateData.password || existingAdmin.password,
          isPremium: isPremium || false
        });
        
        updatedUser = await newUser.save();
        
        // Delete the old admin record
        await adminModel.findByIdAndDelete(id);
      }
    } else {
      // Update in same collection
      if (role === 'admin' && isCurrentlyAdmin) {
        updatedUser = await adminModel.findByIdAndUpdate(id, updateData, { new: true });
      } else if (role === 'user' && !isCurrentlyAdmin) {
        updateData.isPremium = isPremium || false;
        updatedUser = await userModel.findByIdAndUpdate(id, updateData, { new: true });
      }
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Return user data without password
    const userData = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isPremium: updatedUser.isPremium,
      isAdmin: role === 'admin' ? true : false,
      role: role === 'admin' ? 'admin' : 'user',
      createdAt: updatedUser.createdAt
    };

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: userData
    });

  } catch (error) {
    console.error("Edit user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
