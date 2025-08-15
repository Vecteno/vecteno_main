import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectToDatabase from "@/lib/db";
import Transaction from "@/app/models/transactionModel";
import PricingPlan from "@/app/models/PricingPlan";

export async function GET(req) {
  try {
    await connectToDatabase();

    let userId;

    // ✅ Try getting session via NextAuth
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    }

    // ✅ Fallback: Try verifying custom JWT
    if (!userId) {
      const token = req.cookies.get("token")?.value;
      if (!token) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }

      const payload = await verifyJWT(token);
      userId = payload.id;
    }

    const now = new Date();
    
    // First get all active transactions for debugging
    const allActiveTransactions = await Transaction.find({
      userId,
      expiresAt: { $gt: now },
    }).sort({ expiresAt: -1 });
    
    console.log(`Found ${allActiveTransactions.length} active transactions for user ${userId}`);
    
    if (allActiveTransactions.length === 0) {
      return NextResponse.json({ success: true, currentPlan: null });
    }
    
    // Try to populate planId
    const activeTransaction = await Transaction.findOne({
      userId,
      expiresAt: { $gt: now },
    })
      .sort({ expiresAt: -1 })
      .populate("planId");

    console.log('Active transaction details:', {
      id: activeTransaction?._id,
      planId: activeTransaction?.planId,
      expiresAt: activeTransaction?.expiresAt,
      amount: activeTransaction?.amount
    });

    if (!activeTransaction) {
      return NextResponse.json({ success: true, currentPlan: null });
    }
    
    // If planId is not populated, create a default premium plan response
    if (!activeTransaction.planId) {
      console.log('PlanId not populated, creating default premium response');
      return NextResponse.json({
        success: true,
        currentPlan: {
          name: 'Premium Plan',
          price: activeTransaction.amount,
          level: 1,
          features: ['High Quality Downloads', 'Commercial Use License', 'Priority Support'],
          renewalDate: activeTransaction.expiresAt,
          status: 'active',
          type: 'premium',
          expiresAt: activeTransaction.expiresAt
        },
      });
    }

    const plan = activeTransaction.planId;

    // Determine plan type based on level or name
    const isPremium = plan.level > 0 || plan.name.toLowerCase().includes('premium');
    
    return NextResponse.json({
      success: true,
      currentPlan: {
        name: plan.name,
        price: plan.discountedPrice || plan.originalPrice,
        discountedPrice: plan.discountedPrice,
        originalPrice: plan.originalPrice,
        level: plan.level,
        features: plan.features,
        renewalDate: activeTransaction.expiresAt,
        status: 'active', // Since we're only returning active transactions
        type: isPremium ? 'premium' : 'basic',
        expiresAt: activeTransaction.expiresAt
      },
    });
  } catch (err) {
    console.error("Current Plan API Error:", err);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
