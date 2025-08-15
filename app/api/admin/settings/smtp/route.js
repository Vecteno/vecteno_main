import { NextResponse } from "next/server";
import SettingsModel from "@/app/models/settingsModel";
import connectToDatabase from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

// POST - Save SMTP settings
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

    const smtpConfig = await req.json();

    // Validate required fields
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.password) {
      return NextResponse.json(
        { error: "Missing required SMTP configuration fields" },
        { status: 400 }
      );
    }

    // Get or create settings
    let settings = await SettingsModel.findById('app_settings');
    if (!settings) {
      settings = new SettingsModel({ _id: 'app_settings' });
    }

    // Update SMTP settings
    settings.smtp = {
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port),
      secure: smtpConfig.secure || false,
      user: smtpConfig.user,
      password: smtpConfig.password,
      senderEmail: smtpConfig.senderEmail || smtpConfig.user
    };

    await settings.save();

    console.log(`📧 SMTP settings updated by admin: ${decoded.id}`);
    
    return NextResponse.json({
      success: true,
      message: "SMTP settings saved successfully"
    });

  } catch (error) {
    console.error("🔥 Error saving SMTP settings:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to save SMTP settings" },
      { status: 500 }
    );
  }
}
