import { NextResponse } from 'next/server';
import { getTransporter } from '@/lib/nodemailer';
import SettingsModel from '@/app/models/settingsModel';

export async function POST(request) {
  try {
    const { name, email, message, mobile } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get dynamic SMTP settings
    const transporter = await getTransporter();
    const settings = await SettingsModel.findById('app_settings');

    // Email template for the company
    const mailOptions = {
      from: settings?.smtp?.senderEmail || settings?.smtp?.user,
      to: 'vectenoindia@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${mobile ? `<p><strong>Mobile:</strong> ${mobile}</p>` : ''}
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #4F46E5; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 12px;">
            This message was sent from the Vecteno contact form at ${new Date().toLocaleString()}.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send auto-reply to the user
    const autoReplyOptions = {
      from: settings?.smtp?.senderEmail || settings?.smtp?.user,
      to: email,
      subject: 'Thank you for contacting Vecteno - Message Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Thank You for Contacting Vecteno!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message:</h3>
            <p style="margin-bottom: 0;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p>If you have any urgent inquiries, please feel free to contact us directly at:</p>
          <ul>
            <li>Email: vectenoindia@gmail.com</li>
            <li>Address: Gudamalani, Barmer (Rajasthan), India</li>
          </ul>
          
          <p>Best regards,<br>
          <strong>Vecteno Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(autoReplyOptions);

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
