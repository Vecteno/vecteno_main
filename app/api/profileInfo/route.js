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

    // 🔹 Custom token
    const token = request.cookies.get("token")?.value;
    if (token) {
      try {
        const payload = await verifyJWT(token);
        userId = payload.id;
      } catch {
        userId = null;
      }
    }
    
    // 🔹 Fallback NextAuth
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    // 🔹 No auth
    if (!userId) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 401 }
      );
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔹 Premium check
    const now = new Date();
    const activeTransactions = await Transaction.find({
      userId: user._id,
      expiresAt: { $gt: now },
    });

    let isPremium = false;
    let premiumExpiresAt = null;
    if (activeTransactions.length > 0) {
      isPremium = true;
      premiumExpiresAt = activeTransactions.sort(
        (a, b) => new Date(b.expiresAt) - new Date(a.expiresAt)
      )[0].expiresAt;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isPremium,
        premiumExpiresAt,
      },
    });
  } catch (err) {
    console.error("ProfileInfo error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
