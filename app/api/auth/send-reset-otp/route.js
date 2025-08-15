import { NextResponse } from "next/server";
import userModel from "@/app/models/userModel";
import connectToDatabase from "@/lib/db";
import { getTransporter } from "@/lib/nodemailer";
import { PASSWORD_RESET_TEMPLATE } from "@/lib/emailTemplates";

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is Required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "No account found with this email address. Please check your email or sign up for a new account.",
        notRegistered: true
      });
    }

    // Check if user is verified (skip for Google users)
    if (!user.isGoogleUser && !user.isEmailVerified) {
      return NextResponse.json({ 
        success: false, 
        message: "This email is not verified yet. Please complete your signup process first.",
        needsVerification: true,
        email: user.email
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await user.save();
    console.log("✅ OTP saved to DB:", otp);

    const mailOption = {
      from: process.env.EMAIL_HOST_USER,
      to: user.email,
      subject: "Password Reset OTP - Vecteno",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    await getTransporter.sendMail(mailOption);

    return NextResponse.json({
      success: true,
      message: "OTP Sent To Your Email",
      otp, // 👈 for dev only
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
