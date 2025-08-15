import { NextResponse } from "next/server";
import userModel from "@/app/models/userModel";
import SettingsModel from "@/app/models/settingsModel";
import connectToDatabase from "@/lib/db";
import { getTransporter } from "@/lib/nodemailer";
import { EMAIL_VERIFICATION_TEMPLATE } from "@/lib/emailTemplates";

export async function POST(request) {
  try {
    await connectToDatabase();
    const { name, email, password, mobile } = await request.json();

    if (!email || !name) {
      return NextResponse.json({
        success: false,
        message: "Email and name are required",
      });
    }

    // Check if user already exists and is verified
    const existingUser = await userModel.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return NextResponse.json({
        success: false,
        message: "User already exists and is verified",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // If user exists but not verified, update the OTP
    if (existingUser && !existingUser.isEmailVerified) {
      existingUser.emailVerificationOtp = otp;
      existingUser.emailVerificationOtpExpireAt = otpExpireAt;
      existingUser.name = name;
      existingUser.password = password;
      existingUser.mobile = mobile;
      await existingUser.save();
    } else {
      // Create new user (but not verified yet)
      const newUser = new userModel({
        name,
        email,
        password,
        mobile,
        isEmailVerified: false,
        emailVerificationOtp: otp,
        emailVerificationOtpExpireAt: otpExpireAt,
      });
      await newUser.save();
    }

    // Send verification email
    const transporter = await getTransporter();
    const settings = await SettingsModel.findById('app_settings');
    
    const mailOptions = {
      from: settings?.smtp?.senderEmail || settings?.smtp?.user,
      to: email,
      subject: "Verify Your Email - Vecteno",
      html: EMAIL_VERIFICATION_TEMPLATE
        .replace("{{otp}}", otp)
        .replace("{{name}}", name),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Verification OTP sent to your email",
      email: email, // Send back email for verification page
    });
  } catch (error) {
    console.error("Send signup OTP error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to send verification OTP",
    });
  }
}
