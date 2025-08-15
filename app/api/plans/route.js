import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import PricingPlan from '@/app/models/PricingPlan';

export async function GET() {
  try {
    await connectToDatabase();
    const plans = await PricingPlan.find({ isActive: true }).sort({ level: 1 });
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
