import mongoose from "mongoose";

delete mongoose.connection.models["Transaction"]; // ✅ Force reset

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "PricingPlan", required: true },
  razorpayPaymentId: { type: String, required: true },
  razorpayOrderId: { type: String, required: true },
  razorpaySignature: { type: String, required: true },
  amount: { type: Number, required: true },
  expiresAt: { type: Date, required: true }, // ✅ Important
  createdAt: { type: Date, default: Date.now },
});

const Transaction =
  mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

export default Transaction;
