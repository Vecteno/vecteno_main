import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/db";
import User from "@/app/models/userModel";
import Transaction from "@/app/models/transactionModel";
import PricingPlan from "@/app/models/PricingPlan";
import Coupon from "@/app/models/couponModel";
import { verifyJWT } from "@/lib/jwt";
import { getToken } from "next-auth/jwt";
import { getRazorpayConfig } from "@/lib/razorpay";

export async function POST(req) {
  await connectToDatabase();

  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, couponCode } = body;

  try {
    // Try to get JWT token from cookies (for normal login)
    const jwtToken = req.cookies.get("token")?.value;

    let userId = null;

    if (jwtToken) {
      // If custom JWT exists, verify and extract user
      const payload = await verifyJWT(jwtToken);
      userId = payload.id;
    } else {
      // Else fallback to NextAuth token for Google login
      const nextAuthToken = await getToken({ req });
      if (!nextAuthToken || !nextAuthToken.id) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
      userId = nextAuthToken.id;
    }

    // ✅ Verify Razorpay signature
    const razorpayConfig = await getRazorpayConfig();
    const generatedSignature = crypto
      .createHmac("sha256", razorpayConfig.keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Signature mismatch" },
        { status: 400 }
      );
    }

    // Get plan info
    const plan = await PricingPlan.findById(planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Invalid plan" },
        { status: 400 }
      );
    }

    // ✅ Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.validityInDays);

    // If coupon code is provided, mark as used
    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode,
        usedBy: { $nin: [userId] },
        validTill: { $gte: new Date() }
      });

      if (coupon) {
        coupon.usedBy.push(userId);
        coupon.usageLimit -= 1;
        await coupon.save();
      }
    }

    // ✅ Save transaction
    const transaction = await Transaction.create({
      userId,
      planId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: body.amount || 0,
      expiresAt,
      couponCode: couponCode || null,
    });

    // Get all valid transactions
    const now = new Date();
    const activeTransactions = await Transaction.find({
      userId,
      expiresAt: { $gt: now },
    });

    // ✅ Update user premium status
    await User.findByIdAndUpdate(userId, {
      isPremium: activeTransactions.length > 0,
      premiumExpiresAt:
        activeTransactions.length > 0
          ? activeTransactions.sort(
              (a, b) => new Date(b.expiresAt) - new Date(a.expiresAt)
            )[0].expiresAt
          : null,
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
