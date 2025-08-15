import connectToDatabase from "@/lib/db";
import PricingPlan from "@/app/models/PricingPlan";
import Transaction from "@/app/models/transactionModel";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import PricingClient from "./PricingClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  await connectToDatabase();

  const plans = await PricingPlan.find({ isActive: true }).sort({ level: 1 });

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let currentPlan = null;
  let userId = null;
  let isAuthenticated = false;

  try {
    // Check JWT token first
    if (token) {
      try {
        const payload = await verifyJWT(token);
        userId = payload.id;
        isAuthenticated = true;
      } catch (err) {
        console.log('JWT token invalid or expired');
        // Token is invalid, don't use it
      }
    }
    
    // Fallback to NextAuth session if no valid JWT
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
        isAuthenticated = true;
      }
    }

    // Only check for current plan if user is authenticated
    if (userId && isAuthenticated) {
      const now = new Date();
      const activeTransaction = await Transaction.findOne({
        userId,
        expiresAt: { $gt: now },
      })
        .sort({ expiresAt: -1 })
        .populate("planId");

      if (activeTransaction?.planId) {
        currentPlan = {
          _id: activeTransaction.planId._id.toString(),
          level: activeTransaction.planId.level,
          name: activeTransaction.planId.name,
        };
      }
    }
  } catch (error) {
    console.error("Failed to determine current plan:", error.message);
    // Reset values on error
    currentPlan = null;
    isAuthenticated = false;
  }

  return (
    <PricingClient
      plans={JSON.parse(JSON.stringify(plans))}
      currentPlan={currentPlan}
    />
  );
}
