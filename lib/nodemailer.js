import nodemailer from 'nodemailer';

import SettingsModel from '@/app/models/settingsModel';

async function createTransporter() {
  const settings = await SettingsModel.findById('app_settings');
  if (!settings || !settings.smtp) {
    throw new Error('SMTP settings not configured');
  }

  return nodemailer.createTransport({
    host: settings.smtp.host,
    port: settings.smtp.port,
    secure: settings.smtp.secure,
    auth: {
      user: settings.smtp.user,
      pass: settings.smtp.password,
    },
  });
}

export async function getTransporter() {
  return await createTransporter();
}

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const settings = await SettingsModel.findById('app_settings');
    if (!settings || !settings.smtp) {
      throw new Error('SMTP settings not configured');
    }

    console.log('📧 Sending email to:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 SMTP User:', settings.smtp.user);
    
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: settings.smtp.senderEmail || settings.smtp.user,
      to,
      subject,
      html,
      text
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('❌ Full error:', error);
    throw error;
  }
};
