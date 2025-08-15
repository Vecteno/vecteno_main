import { NextResponse } from "next/server";
import { getTransporter } from "@/lib/nodemailer";

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is required",
      });
    }

    // Check environment variables
    console.log("📧 Email config check:");
    console.log("EMAIL_HOST_USER:", process.env.EMAIL_HOST_USER ? "✅ Set" : "❌ Missing");
    console.log("EMAIL_HOST_PASSWORD:", process.env.EMAIL_HOST_PASSWORD ? "✅ Set" : "❌ Missing");

    if (!process.env.EMAIL_HOST_USER || !process.env.EMAIL_HOST_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Email configuration missing in environment variables",
      });
    }

    // Test SMTP connection
    try {
      await getTransporter.verify();
      console.log("✅ SMTP connection verified");
    } catch (verifyError) {
      console.error("❌ SMTP verification failed:", verifyError);
      return NextResponse.json({
        success: false,
        message: `SMTP connection failed: ${verifyError.message}`,
      });
    }

    // Send test email
    const testMailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: email,
      subject: "Test Email - Vecteno",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email from Vecteno</h2>
          <p>This is a test email to verify that the email service is working correctly.</p>
          <p>If you received this email, the configuration is working!</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
    };

    const info = await getTransporter.sendMail(testMailOptions);
    console.log("✅ Test email sent:", info.messageId);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("❌ Test email error:", error);
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}
