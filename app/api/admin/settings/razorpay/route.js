import { NextResponse } from "next/server";
import SettingsModel from "@/app/models/settingsModel";
import connectToDatabase from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

// POST - Save Razorpay settings
export async function POST(req) {
  try {
    await connectToDatabase();

    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = await verifyJWT(token);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: "Invalid admin token" },
        { status: 401 }
      );
    }

    const razorpayConfig = await req.json();

    // Validate required fields
    if (!razorpayConfig.keyId || !razorpayConfig.keySecret) {
      return NextResponse.json(
        { error: "Missing required Razorpay configuration fields" },
        { status: 400 }
      );
    }

    // Get or create settings
    let settings = await SettingsModel.findById('app_settings');
    if (!settings) {
      settings = new SettingsModel({ _id: 'app_settings' });
    }

    // Update Razorpay settings
    settings.razorpay = {
      keyId: razorpayConfig.keyId,
      keySecret: razorpayConfig.keySecret,
      webhookSecret: razorpayConfig.webhookSecret || ''
    };

    await settings.save();

    console.log(`💳 Razorpay settings updated by admin: ${decoded.id}`);
    
    return NextResponse.json({
      success: true,
      message: "Razorpay settings saved successfully"
    });

  } catch (error) {
    console.error("🔥 Error saving Razorpay settings:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to save Razorpay settings" },
      { status: 500 }
    );
  }
}
