import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import Transaction from "@/app/models/transactionModel";

export async function GET(request) {
  try {
    await connectToDatabase();
    
    let userId = null;
    
    // Custom token (JWT)
    const token = request.cookies.get("token")?.value;
    if (token) {
      try {
        const payload = await verifyJWT(token);
        userId = payload.id;
      } catch (err) {
        userId = null;
      }
    }
    
    // Fallback to Google-authenticated user via NextAuth
    if (!userId) {
      const session = await getServerSession({ req: request, ...authOptions }); 
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    // Still no user
    if (!userId) {
      return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });   
    }

    // Get all transactions for this user
    const allTransactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
    
    // Premium check
    const now = new Date();
    const activeTransactions = await Transaction.find({
      userId: user._id,
      expiresAt: { $gt: now },
    });

    const debugData = {
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      currentIsPremium: user.isPremium,
      currentPremiumExpiresAt: user.premiumExpiresAt,
      totalTransactions: allTransactions.length,
      activeTransactions: activeTransactions.length,
      activeTransactionDetails: activeTransactions.map(t => ({
        id: t._id,
        planId: t.planId,
        amount: t.amount,
        createdAt: t.createdAt,
        expiresAt: t.expiresAt,
        couponCode: t.couponCode
      })),
      allTransactionDetails: allTransactions.map(t => ({
        id: t._id,
        planId: t.planId,
        amount: t.amount,
        createdAt: t.createdAt,
        expiresAt: t.expiresAt,
        couponCode: t.couponCode,
        isActive: new Date(t.expiresAt) > now
      })),
      currentTime: now,
      shouldBePremium: activeTransactions.length > 0
    };

    return NextResponse.json({ success: true, debug: debugData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error", details: err.message }, { status: 500 });       
  }
}
