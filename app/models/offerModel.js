import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: String, // URL to image/banner
  imagePublicId: {
    type: String,
  },
  discountPercent: {
    type: Number,
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTill: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OfferModel =
  mongoose.models.Offer || mongoose.model("Offer", offerSchema);
export default OfferModel;
