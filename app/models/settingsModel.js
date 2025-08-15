import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  // SMTP Configuration
  smtp: {
    host: { type: String, default: 'smtp.gmail.com' },
    port: { type: Number, default: 587 },
    secure: { type: Boolean, default: false },
    user: { type: String, default: '' },
    password: { type: String, default: '' },
    senderEmail: { type: String, default: '' }
  },
  
  // Razorpay Configuration
  razorpay: {
    keyId: { type: String, default: '' },
    keySecret: { type: String, default: '' },
    webhookSecret: { type: String, default: '' }
  },
  
  // Other general settings
  siteName: { type: String, default: 'Vecteno' },
  siteUrl: { type: String, default: 'http://localhost:3000' },
  
  // Single document identifier (we'll only have one settings record)
  _id: { type: String, default: 'app_settings' }
}, {
  timestamps: true
});

const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
export default SettingsModel;
