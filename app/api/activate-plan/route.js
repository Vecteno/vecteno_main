import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/app/models/userModel';
import Transaction from '@/app/models/transactionModel';
import PricingPlan from '@/app/models/PricingPlan';
import Coupon from '@/app/models/couponModel';

export async function POST(req) {
  try {
    await dbConnect();
    const { planId, userId, couponCode } = await req.json();

    // Validate inputs
    if (!planId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Plan ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get plan info
    const plan = await PricingPlan.findById(planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: 'Invalid plan' },
        { status: 400 }
      );
    }

    // If coupon code is provided, validate and mark as used
    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode,
        usedBy: { $nin: [userId] },
        validTill: { $gte: new Date() }
      });

      if (!coupon) {
        return NextResponse.json(
          { success: false, message: 'Invalid coupon' },
          { status: 400 }
        );
      }

      // Mark coupon as used
      coupon.usedBy.push(userId);
      coupon.usageLimit -= 1;
      await coupon.save();
    }

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.validityInDays);

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      planId,
      razorpayOrderId: 'FREE_ACTIVATION',
      razorpayPaymentId: 'FREE_ACTIVATION',
      razorpaySignature: 'FREE_ACTIVATION',
      amount: 0,
      expiresAt,
      couponCode: couponCode || null,
    });

    // Get all valid transactions for the user
    const now = new Date();
    const activeTransactions = await Transaction.find({
      userId,
      expiresAt: { $gt: now },
    });

    // ✅ Update user premium status AND plan name
    await User.findByIdAndUpdate(userId, {
      isPremium: activeTransactions.length > 0,
      planName: plan.name, // ✅ CRITICAL: Save the actual plan name
      premiumExpiresAt:
        activeTransactions.length > 0
          ? activeTransactions.sort(
              (a, b) => new Date(b.expiresAt) - new Date(a.expiresAt)
            )[0].expiresAt
          : null,
    });

    return NextResponse.json({
      success: true,
      message: 'Plan activated successfully',
      transaction
    });

  } catch (error) {
    console.error('Plan activation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to activate plan' },
      { status: 500 }
    );
  }
}


// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/db';
// import User from '@/app/models/userModel';
// import Transaction from '@/app/models/transactionModel';
// import PricingPlan from '@/app/models/PricingPlan';
// import Coupon from '@/app/models/couponModel';

// export async function POST(req) {
//   try {
//     await dbConnect();
//     const { planId, userId, couponCode } = await req.json();

//     // Validate inputs
//     if (!planId || !userId) {
//       return NextResponse.json(
//         { success: false, message: 'Plan ID and User ID are required' },
//         { status: 400 }
//       );
//     }

//     // Get plan info
//     const plan = await PricingPlan.findById(planId);
//     if (!plan) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid plan' },
//         { status: 400 }
//       );
//     }

//     // If coupon code is provided, validate and mark as used
//     if (couponCode) {
//       const coupon = await Coupon.findOne({ 
//         code: couponCode,
//         usedBy: { $nin: [userId] },
//         validTill: { $gte: new Date() }
//       });

//       if (!coupon) {
//         return NextResponse.json(
//           { success: false, message: 'Invalid coupon' },
//           { status: 400 }
//         );
//       }

//       // Mark coupon as used
//       coupon.usedBy.push(userId);
//       coupon.usageLimit -= 1;
//       await coupon.save();
//     }

//     // Calculate expiry
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + plan.validityInDays);

//     // Create transaction record
//     const transaction = await Transaction.create({
//       userId,
//       planId,
//       razorpayOrderId: 'FREE_ACTIVATION',
//       razorpayPaymentId: 'FREE_ACTIVATION',
//       razorpaySignature: 'FREE_ACTIVATION',
//       amount: 0,
//       expiresAt,
//       couponCode: couponCode || null,
//     });

//     // Get all valid transactions for the user
//     const now = new Date();
//     const activeTransactions = await Transaction.find({
//       userId,
//       expiresAt: { $gt: now },
//     });

//     // Update user premium status
//     await User.findByIdAndUpdate(userId, {
//       isPremium: activeTransactions.length > 0,
//       premiumExpiresAt:
//         activeTransactions.length > 0
//           ? activeTransactions.sort(
//               (a, b) => new Date(b.expiresAt) - new Date(a.expiresAt)
//             )[0].expiresAt
//           : null,
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Plan activated successfully',
//       transaction
//     });

//   } catch (error) {
//     console.error('Plan activation error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Failed to activate plan' },
//       { status: 500 }
//     );
//   }
// }
