import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { verifyJWT } from "@/lib/jwt";

// POST - Test SMTP connection
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

    const smtpConfig = await req.json();

    // Validate required fields
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.password) {
      return NextResponse.json(
        { error: "Missing required SMTP configuration fields" },
        { status: 400 }
      );
    }

    // Create transporter with provided config
    const transporter = nodemailer.createTransporter({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port),
      secure: smtpConfig.secure || false,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });

    // Test the connection
    await transporter.verify();

    console.log(`📧 SMTP connection test successful for admin: ${decoded.id}`);
    
    return NextResponse.json({
      success: true,
      message: "SMTP connection test successful"
    });

  } catch (error) {
    console.error("🔥 SMTP connection test failed:", error.message);
    
    // Provide more specific error messages
    let errorMessage = "SMTP connection failed";
    if (error.code === 'EAUTH') {
      errorMessage = "Authentication failed. Please check your email and password.";
    } else if (error.code === 'ECONNECTION') {
      errorMessage = "Connection failed. Please check your host and port settings.";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Connection timed out. Please check your network connection.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
