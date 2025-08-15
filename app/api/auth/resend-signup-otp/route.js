import { NextResponse } from "next/server";
import userModel from "@/app/models/userModel";
import connectToDatabase from "@/lib/db";
import { getTransporter } from "@/lib/nodemailer";
import { EMAIL_VERIFICATION_TEMPLATE } from "@/lib/emailTemplates";

export async function POST(request) {
  try {
    console.log("🔄 Resend OTP request received");
    await connectToDatabase();
    const { email } = await request.json();

    console.log("📧 Resending OTP for email:", email);

    if (!email) {
      console.log("❌ No email provided");
      return NextResponse.json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log("❌ User not found for email:", email);
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    console.log("👤 User found:", user.name, "- Verified:", user.isEmailVerified);

    // Check if user is already verified
    if (user.isEmailVerified) {
      console.log("✅ Email already verified");
      return NextResponse.json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    console.log("🔑 Generated new OTP:", otp);

    // Update user with new OTP
    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpireAt = otpExpireAt;
    await user.save();

    console.log("💾 OTP saved to database");

    // Check email configuration
    const emailUser = process.env.SMTP_USER || process.env.EMAIL_HOST_USER;
    const emailPass = process.env.SMTP_PASS || process.env.EMAIL_HOST_PASSWORD;
    
    if (!emailUser || !emailPass) {
      console.error("❌ Email configuration missing");
      console.log("SMTP_USER:", process.env.SMTP_USER ? "✅ Set" : "❌ Missing");
      console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✅ Set" : "❌ Missing");
      return NextResponse.json({
        success: false,
        message: "Email service not configured",
      });
    }

    // Send verification email
    const mailOptions = {
      from: process.env.SMTP_USER || process.env.EMAIL_HOST_USER,
      to: email,
      subject: "Verify Your Email - Vecteno (Resent)",
      html: EMAIL_VERIFICATION_TEMPLATE
        .replace("{{otp}}", otp)
        .replace("{{name}}", user.name || "User"),
    };

    console.log("📤 Sending email to:", email);
    console.log("📧 Email config - From:", process.env.SMTP_USER || process.env.EMAIL_HOST_USER);
    
    // Test transporter connection first
    try {
      await getTransporter.verify();
      console.log("✅ SMTP connection verified");
    } catch (verifyError) {
      console.error("❌ SMTP connection failed:", verifyError);
      return NextResponse.json({
        success: false,
        message: "Email service connection failed. Please try again later.",
      }, { status: 500 });
    }
    
    try {
      const info = await getTransporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.messageId);
      console.log("📬 Email info:", info.response);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      console.error("🔍 Email error details:", {
        code: emailError.code,
        response: emailError.response,
        responseCode: emailError.responseCode
      });
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Verification OTP resent to your email",
      // For development only - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error("❌ Resend signup OTP error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to resend verification OTP",
    }, { status: 500 });
  }
}
