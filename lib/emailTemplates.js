export const PASSWORD_RESET_TEMPLATE = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
    <div style="max-width: 500px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello <strong>{{email}}</strong>,</p>
      <p>We received a request to reset your password. Use the following OTP to proceed:</p>
      <h1 style="color: #4A90E2; letter-spacing: 4px;">{{otp}}</h1>
      <p>This OTP is valid for 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #888;">© 2025 Vecteno. All rights reserved.</p>
    </div>
  </div>
`;

export const EMAIL_VERIFICATION_TEMPLATE = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
    <div style="max-width: 500px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin-bottom: 10px;">Welcome to Vecteno!</h1>
        <p style="color: #666; font-size: 16px;">Please verify your email address</p>
      </div>
      <p>Hello <strong>{{name}}</strong>,</p>
      <p>Thank you for signing up! To complete your registration, please use the following verification code:</p>
      <div style="text-align: center; margin: 30px 0;">
        <h1 style="color: #e74c3c; letter-spacing: 4px; font-size: 32px; margin: 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #e74c3c;">{{otp}}</h1>
      </div>
      <p style="color: #666;">This verification code is valid for <strong>10 minutes</strong>.</p>
      <p style="color: #666;">If you didn't create an account with us, you can safely ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #888; text-align: center;">© 2025 Vecteno. All rights reserved.</p>
    </div>
  </div>
`;

export const LOGIN_OTP_TEMPLATE = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
    <div style="max-width: 500px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin-bottom: 10px;">Admin Login Verification</h1>
        <p style="color: #666; font-size: 16px;">Two-Factor Authentication</p>
      </div>
      <p>Hello <strong>{{name}}</strong>,</p>
      <p>A login attempt was made to your admin account. Please use the following verification code to complete your login:</p>
      <div style="text-align: center; margin: 30px 0;">
        <h1 style="color: #2196F3; letter-spacing: 4px; font-size: 32px; margin: 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #2196F3;">{{otp}}</h1>
      </div>
      <p style="color: #666;">This verification code is valid for <strong>10 minutes</strong>.</p>
      <p style="color: #e74c3c;"><strong>Important:</strong> If you didn't attempt to log in, please secure your account immediately.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #888; text-align: center;">© 2025 Vecteno Admin Panel. All rights reserved.</p>
    </div>
  </div>
`;

// Helper function to generate login OTP email
export const getLoginOtpTemplate = (name, otp) => {
  return LOGIN_OTP_TEMPLATE
    .replace('{{name}}', name)
    .replace('{{otp}}', otp);
};
