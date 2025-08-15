import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PricingPlan from '@/app/models/PricingPlan';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const plan = await PricingPlan.findById(id);
    
    if (!plan) {
      return NextResponse.json(
        { success: false, message: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan
    });

  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}
