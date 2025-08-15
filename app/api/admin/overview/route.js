import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import ImageModel from "@/app/models/Image";
import Transaction from "@/app/models/transactionModel";

export async function GET() {
  try {
    await connectToDatabase();

    // Get basic counts
    const userCount = await userModel.countDocuments();
    const imageCount = await ImageModel.countDocuments();
    
    // Calculate total downloads (sum of likes as proxy for downloads)
    const images = await ImageModel.find({}, 'likes');
    const downloadCount = images.reduce((total, image) => total + (image.likes || 0), 0);
    
    // Calculate revenue from transactions
    const transactions = await Transaction.find({}, 'amount');
    const revenue = transactions.reduce((total, transaction) => total + (transaction.amount || 0), 0);
    
    // Get trending images count
    const trendingCount = await ImageModel.countDocuments({ isTrending: true });
    
    // Get premium images count
    const premiumCount = await ImageModel.countDocuments({ type: "premium" });
    
    // Get recent activities (last 10 users registered)
    const recentUsers = await userModel.find({}, 'email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get recent images uploaded
    const recentImages = await ImageModel.find({}, 'title createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      userCount,
      imageCount,
      downloadCount,
      revenue: Math.round(revenue / 100), // Convert from paise to rupees
      trendingCount,
      premiumCount,
      recentUsers: recentUsers.map(user => ({
        email: user.email,
        createdAt: user.createdAt
      })),
      recentImages: recentImages.map(image => ({
        title: image.title,
        createdAt: image.createdAt
      }))
    });
  } catch (err) {
    console.error("Admin Overview Error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
