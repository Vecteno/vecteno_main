import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import AdminModel from "@/app/models/adminUserModel";

export const POST = async (req) => {
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
    
    const { currentPassword, newPassword } = await req.json();
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Find admin with password field
    const admin = await AdminModel.findById(decoded.id);
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    // Verify current password (handle both hashed and plain text passwords)
    let isCurrentPasswordValid = false;
    
    // Check if password is already hashed (starts with $2a$, $2b$, etc.)
    if (admin.password.startsWith('$2')) {
      // Password is hashed, use bcrypt.compare
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    } else {
      // Password is plain text (legacy), compare directly
      isCurrentPasswordValid = admin.password === currentPassword;
    }
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await AdminModel.findByIdAndUpdate(decoded.id, {
      password: hashedNewPassword
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Password change error:", error);
    
    if (error.message?.includes('JWS') || error.message?.includes('token')) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
};
