import { NextResponse } from "next/server";
import adminUserModel from "@/app/models/adminUserModel";
import SettingsModel from "@/app/models/settingsModel";
import connectToDatabase from "@/lib/db";
import { getTransporter } from "@/lib/nodemailer";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    console.log("BODY:", body);

    const { email } = body;

    if (!email) {
      console.log("❌ Missing email");
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if admin exists
    const admin = await adminUserModel.findOne({ email });
    console.log("Admin from DB:", admin ? "Found" : "Not found");
    
    if (!admin) {
      console.log("❌ Admin not found");
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated OTP:", otp);

    // Set OTP expiration to 10 minutes from now
    const otpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update admin with OTP
    admin.resetOtp = otp;
    admin.resetOtpExpireAt = otpExpireAt;
    await admin.save();
    
    // Debug: Verify OTP was saved
    const savedAdmin = await adminUserModel.findOne({ email });
    console.log("✅ OTP saved to admin:", {
      email: savedAdmin.email,
      resetOtp: savedAdmin.resetOtp,
      resetOtpExpireAt: savedAdmin.resetOtpExpireAt,
      expireDate: new Date(savedAdmin.resetOtpExpireAt)
    });

    // Get dynamic SMTP settings and transporter
    const transporter = await getTransporter();
    const settings = await SettingsModel.findById('app_settings');

    // Email template for admin password reset
    const mailOptions = {
      from: settings?.smtp?.senderEmail || settings?.smtp?.user,
      to: email,
      subject: "Admin Password Reset - OTP Verification",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Admin Password Reset</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello Admin,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              You have requested to reset your admin password. Please use the following OTP to proceed with the password reset:
            </p>
            
            <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <h2 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 3px;">${otp}</h2>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">This OTP is valid for 10 minutes</p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              If you did not request this password reset, please ignore this email and your password will remain unchanged.
            </p>
            
            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ Reset OTP email sent successfully");

    return NextResponse.json(
      { 
        success: true, 
        message: "Password reset OTP has been sent to your email" 
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("🔥 Error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
