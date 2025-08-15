import { NextResponse } from "next/server";
import adminUserModel from "@/app/models/adminUserModel";
import connectToDatabase from "@/lib/db";
import { sendEmail } from "@/lib/nodemailer";
import { getLoginOtpTemplate } from "@/lib/emailTemplates";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Find admin
    const admin = await adminUserModel.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Check if 2FA is enabled globally (if any admin has 2FA enabled, all admins can use it)
    const anyAdmin2FAEnabled = await adminUserModel.findOne({ twoFactorEnabled: true });
    
    if (!anyAdmin2FAEnabled) {
      return NextResponse.json(
        { success: false, message: "Two-factor authentication is not enabled globally" },
        { status: 400 }
      );
    }
    
    console.log(`🔐 Global 2FA is active, sending OTP to ${email} (enforced by admin: ${anyAdmin2FAEnabled.email})`);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to database
    admin.loginOtp = otp;
    admin.loginOtpExpireAt = otpExpireAt;
    await admin.save();

    // Send OTP email
    console.log(`🔢 Generated OTP: ${otp}`);
    console.log(`📧 Attempting to send OTP email to: ${email}`);
    
    let emailSent = false;
    let emailError = null;
    
    try {
      const emailHtml = getLoginOtpTemplate(admin.name || 'Admin', otp);
      
      await sendEmail({
        to: email,
        subject: "Admin Login Verification Code",
        html: emailHtml
      });
      
      emailSent = true;
      console.log(`✅ Login OTP sent successfully to admin: ${email}`);
    } catch (error) {
      emailError = error;
      console.error(`❌ Email sending failed for ${email}:`, error.message);
      console.error(`❌ Full email error:`, error);
      
      // For debugging - show OTP in console when email fails
      console.log('\n' + '='.repeat(50));
      console.log(`⚠️ EMAIL FAILED - DEBUG MODE`);
      console.log(`📝 Admin Email: ${email}`);
      console.log(`🔢 LOGIN OTP: ${otp}`);
      console.log(`⏰ Valid for 10 minutes`);
      console.log('='.repeat(50) + '\n');
    }

    return NextResponse.json({
      success: true,
      message: "Login verification code sent to your email"
    });

  } catch (error) {
    console.error("🔥 Error in send-login-otp:", error.message);
    console.error("🔥 Full error:", error);
    return NextResponse.json(
      { success: false, message: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
