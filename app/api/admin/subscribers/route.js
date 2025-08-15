import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch only premium users (subscribers)
    const premiumUsers = await userModel.find({ 
      isPremium: true 
    }).select("-password").sort({ premiumExpiresAt: 1 });
    
    // Format subscribers data with additional fields
    const subscribers = premiumUsers.map(user => ({
      _id: user._id,
      name: user.name || "",
      email: user.email,
      isPremium: user.isPremium,
      planName: user.planName || "Premium Plan", // Add planName field if not exists
      createdAt: user.createdAt,
      premiumExpiresAt: user.premiumExpiresAt,
      profileImage: user.profileImage,
      // Calculate additional fields
      planStartDate: user.createdAt, // Assuming plan started when user was created
      planEndDate: user.premiumExpiresAt,
      remainingDays: user.premiumExpiresAt ? Math.max(0, Math.ceil((new Date(user.premiumExpiresAt) - new Date()) / (1000 * 60 * 60 * 24))) : 0
    }));
    
    return NextResponse.json({ 
      success: true, 
      subscribers: subscribers,
      total: subscribers.length 
    });
  } catch (err) {
    console.error("Subscribers fetch error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}
