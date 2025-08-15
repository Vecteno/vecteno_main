import Razorpay from 'razorpay';
import SettingsModel from '@/app/models/settingsModel';

export async function getRazorpayInstance() {
  const settings = await SettingsModel.findById('app_settings');
  if (!settings || !settings.razorpay) {
    throw new Error('Razorpay settings not configured');
  }

  return new Razorpay({
    key_id: settings.razorpay.keyId,
    key_secret: settings.razorpay.keySecret,
  });
}

export async function getRazorpayConfig() {
  const settings = await SettingsModel.findById('app_settings');
  if (!settings || !settings.razorpay) {
    throw new Error('Razorpay settings not configured');
  }

  return settings.razorpay;
}
