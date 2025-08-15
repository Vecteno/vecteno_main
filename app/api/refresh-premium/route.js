import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import Transaction from "@/app/models/transactionModel";

export async function POST(request) {
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

    // Premium check
    const now = new Date();
    const activeTransactions = await Transaction.find({
      userId: user._id,
      expiresAt: { $gt: now },
    });

    // Update user premium status
    if (activeTransactions.length > 0) {
      const latestExpiry = activeTransactions.sort(
        (a, b) => new Date(b.expiresAt) - new Date(a.expiresAt)
      )[0].expiresAt;
      
      user.isPremium = true;
      user.premiumExpiresAt = latestExpiry;
    } else {
      user.isPremium = false;
      user.premiumExpiresAt = null;
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: "Premium status refreshed",
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      activeTransactions: activeTransactions.length
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error", details: err.message }, { status: 500 });       
  }
}
