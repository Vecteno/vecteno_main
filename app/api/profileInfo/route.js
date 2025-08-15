import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import Transaction from "@/app/models/transactionModel";

export async function GET(request) {
  try {
    console.log('ProfileInfo API called');
    await connectToDatabase();
    
    let userId = null;
    
    // Custom token (JWT)
    const token = request.cookies.get("token")?.value;
    console.log('JWT Token found:', !!token);
    if (token) {
      try {
        const payload = await verifyJWT(token);
        userId = payload.id;
        console.log('JWT userId:', userId);
      } catch (err) {
        console.log('JWT verification failed:', err.message);
        userId = null;
      }
    }
    
    // Fallback to Google-authenticated user via NextAuth
    if (!userId) {
      console.log('Trying NextAuth session...');
      const session = await getServerSession({ req: request, ...authOptions }); 
      console.log('NextAuth session:', !!session, session?.user?.id);
      if (session?.user?.id) {
        userId = session.user.id;
        console.log('NextAuth userId:', userId);
      }
    }

    // Still no user
    if (!userId) {
      console.log('No userId found, returning 401');
      return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
    }
    
    console.log('Final userId:', userId);

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

    const userData = user.toObject();
    delete userData.password;

    return NextResponse.json({ success: true, user: userData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });       
  }
}
