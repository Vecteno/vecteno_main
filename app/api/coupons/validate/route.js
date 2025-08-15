import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/app/models/couponModel';

export async function POST(req) {
  try {
    await dbConnect();
    const { code, userId } = await req.json();

    const coupon = await Coupon.findOne({ code, usedBy: { $nin: [userId] }, validTill: { $gte: new Date() }, usageLimit: { $gt: 0 } });

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Invalid or expired coupon' }, { status: 400 });
    }

    return NextResponse.json({ success: true, discountPercent: coupon.discountPercent, coupon });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ success: false, message: 'Error validating coupon' }, { status: 500 });
  }
}
