// ✅ UPDATED models/PricingPlan.js
import mongoose from "mongoose";

const pricingPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number },
  validityInDays: { type: Number, required: true },
  features: [{
    text: { type: String, required: true },
    included: { type: Boolean, default: true }
  }],
  level: { type: Number, required: true }, // ✅ Add this line
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const PricingPlan = mongoose.models.PricingPlan || mongoose.model("PricingPlan", pricingPlanSchema);

export default PricingPlan;
