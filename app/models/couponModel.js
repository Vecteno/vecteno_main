import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
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
  usageLimit: {
    type: Number,
    default: 10, // Allow only 10 users
  },
  usedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ]
});

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
export default Coupon;
