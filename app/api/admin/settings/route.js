import { NextResponse } from "next/server";
import SettingsModel from "@/app/models/settingsModel";
import connectToDatabase from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

// GET - Fetch current settings
export async function GET(req) {
  try {
    await connectToDatabase();

    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = await verifyJWT(token);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: "Invalid admin token" },
        { status: 401 }
      );
    }

    // Get or create settings
    let settings = await SettingsModel.findById('app_settings');
    if (!settings) {
      settings = new SettingsModel({ _id: 'app_settings' });
      await settings.save();
    }

    console.log('✅ Settings fetched successfully');
    
    return NextResponse.json({
      success: true,
      smtp: settings.smtp || {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: '',
        password: '',
        senderEmail: ''
      },
      razorpay: {
        keyId: settings.razorpay?.keyId || '',
        // Don't send secret keys in GET request for security
        keySecret: settings.razorpay?.keySecret ? '••••••••••••' : '',
        webhookSecret: settings.razorpay?.webhookSecret ? '••••••••••••' : ''
      },
      siteName: settings.siteName || 'Vecteno',
      siteUrl: settings.siteUrl || 'http://localhost:3000'
    });

  } catch (error) {
    console.error("🔥 Error fetching settings:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(req) {
  try {
    await connectToDatabase();

    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = await verifyJWT(token);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: "Invalid admin token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, data } = body;

    // Get or create settings
    let settings = await SettingsModel.findById('app_settings');
    if (!settings) {
      settings = new SettingsModel({ _id: 'app_settings' });
    }

    // Update based on type
    if (type === 'smtp') {
      settings.smtp = {
        ...settings.smtp,
        ...data
      };
      console.log(`📧 SMTP settings updated by admin: ${decoded.id}`);
    } else if (type === 'razorpay') {
      settings.razorpay = {
        ...settings.razorpay,
        ...data
      };
      console.log(`💳 Razorpay settings updated by admin: ${decoded.id}`);
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid settings type" },
        { status: 400 }
      );
    }

    await settings.save();

    console.log(`✅ ${type.toUpperCase()} settings saved successfully`);
    
    return NextResponse.json({
      success: true,
      message: `${type.toUpperCase()} settings updated successfully`,
      settings: type === 'smtp' ? settings.smtp : settings.razorpay
    });

  } catch (error) {
    console.error("🔥 Error updating settings:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
