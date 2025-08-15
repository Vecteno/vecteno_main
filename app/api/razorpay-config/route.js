import { NextResponse } from "next/server";
import SettingsModel from "@/app/models/settingsModel";
import connectToDatabase from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();
    
    const settings = await SettingsModel.findById('app_settings');
    if (!settings || !settings.razorpay) {
      return NextResponse.json(
        { error: "Razorpay settings not configured" },
        { status: 400 }
      );
    }

    // Only return the public key (key_id), never the secret
    return NextResponse.json({
      success: true,
      keyId: settings.razorpay.keyId
    });

  } catch (error) {
    console.error("Error fetching Razorpay config:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch Razorpay configuration" },
      { status: 500 }
    );
  }
}
