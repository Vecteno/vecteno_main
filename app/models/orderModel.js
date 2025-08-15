// /models/orderModel.js
import mongoose from "mongoose";

// Delete the model if it exists to avoid OverwriteModelError
delete mongoose.connection.models["Order"];

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
