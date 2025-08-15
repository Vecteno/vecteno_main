import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { verifyJWT } from "@/lib/jwt";

// POST - Test Razorpay connection
export async function POST(req) {
  try {
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

    // Create Razorpay instance with provided config
    const razorpay = new Razorpay({
      key_id: razorpayConfig.keyId,
      key_secret: razorpayConfig.keySecret,
    });

    // Test the connection by fetching account details
    try {
      // This will throw an error if credentials are invalid
      await razorpay.plans.all({ count: 1 });
      
      console.log(`💳 Razorpay connection test successful for admin: ${decoded.id}`);
      
      return NextResponse.json({
        success: true,
        message: "Razorpay connection test successful"
      });
    } catch (razorpayError) {
      console.error("🔥 Razorpay connection test failed:", razorpayError.message);
      
      // Provide more specific error messages
      let errorMessage = "Razorpay connection failed";
      if (razorpayError.error?.code === 'BAD_REQUEST_ERROR') {
        if (razorpayError.error.description?.includes('key_id')) {
          errorMessage = "Invalid Key ID. Please check your Razorpay Key ID.";
        } else if (razorpayError.error.description?.includes('key_secret')) {
          errorMessage = "Invalid Key Secret. Please check your Razorpay Key Secret.";
        } else {
          errorMessage = razorpayError.error.description || "Invalid Razorpay credentials";
        }
      } else if (razorpayError.message) {
        errorMessage = razorpayError.message;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("🔥 Razorpay test error:", error.message);
    return NextResponse.json(
      { error: "Failed to test Razorpay connection" },
      { status: 500 }
    );
  }
}
