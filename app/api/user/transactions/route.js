import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Transaction from "@/app/models/transactionModel";
import { verifyJWT } from "@/lib/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"; // ✅ Correct path

export async function GET(req) {
  await connectToDatabase();

  let userId;
  const token = req.cookies.get("token")?.value;

  try {
    if (token) {
      const payload = await verifyJWT(token);
      userId = payload.id;
    } else {
      const session = await getServerSession({ req, ...authOptions }); // ✅ Fix
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      userId = session.user.id;
    }

    const transactions = await Transaction.find({ userId })
      .populate("planId", "name price discountedPrice")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error("Transaction fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
