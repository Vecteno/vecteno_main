import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not Authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Find user
    const user = await userModel.findById(decoded.userId).select("-password");
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      userData: user
    });

  } catch (error) {
    console.error("User data fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 