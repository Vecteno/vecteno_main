// models/HomepageSettings.js
import mongoose from "mongoose";

const homepageSettingsSchema = new mongoose.Schema({
  heroImageUrl: { type: String, required: false },
  public_id: { type: String }, // for deletion from Cloudinary
  updatedAt: { type: Date, default: Date.now }
});

const HomepageSettings = mongoose.models.HomepageSettings || mongoose.model("HomepageSettings", homepageSettingsSchema);
export default HomepageSettings;
