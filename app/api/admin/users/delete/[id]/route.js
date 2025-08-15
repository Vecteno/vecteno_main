import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import adminModel from "@/app/models/adminUserModel";
import Transaction from "@/app/models/transactionModel";
// import Order from "@/app/models/orderModel"; // Temporarily disabled
import Image from "@/app/models/Image";
import jwt from "jsonwebtoken";

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    // Get and verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No valid token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let adminId;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      adminId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Verify admin exists
    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin not found" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Prevent self-deletion
    if (id === adminId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user/admin exists first
    const userToDelete = await userModel.findById(id);
    const adminToDelete = !userToDelete ? await adminModel.findById(id) : null;
    
    if (!userToDelete && !adminToDelete) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const targetData = userToDelete || adminToDelete;
    const userType = adminToDelete ? 'Admin' : 'User';
    
    // Keep track of deleted items for response
    let deletedItemsCount = {
      transactions: 0,
      orders: 0,
      likes: 0,
    };

    // If deleting a regular user, cascade delete their related data
    if (userToDelete) {
      console.log(`Cascading delete for user: ${userToDelete.name} (${userToDelete.email})`);
      
      // Find all users with same email (in case of Google login creating new account)
      const allUsersWithSameEmail = await userModel.find({ email: userToDelete.email });
      const userIds = allUsersWithSameEmail.map(user => user._id.toString());
      console.log(`Found ${userIds.length} users with email ${userToDelete.email}:`, userIds);
      
      // 1. Delete all transactions for all users with same email
      try {
        const deletedTransactions = await Transaction.deleteMany({ 
          userId: { $in: userIds } 
        });
        deletedItemsCount.transactions = deletedTransactions.deletedCount;
        console.log(`Deleted ${deletedTransactions.deletedCount} transactions for all users with this email`);
      } catch (error) {
        console.error('Error deleting transactions:', error);
        // Continue with other deletions even if this fails
      }
      
      // 2. Delete all orders for this user (temporarily disabled)
      try {
        // const deletedOrders = await Order.deleteMany({ userId: id });
        // deletedItemsCount.orders = deletedOrders.deletedCount;
        console.log(`Skipping order deletion for now`);
      } catch (error) {
        console.error('Error deleting orders:', error);
        // Continue with other deletions even if this fails
      }
      
      // 3. Remove all user IDs with same email from image likes (likedBy arrays)
      try {
        let totalLikesRemoved = 0;
        for (const userId of userIds) {
          const updatedImages = await Image.updateMany(
            { likedBy: userId },
            { 
              $pull: { likedBy: userId },
              $inc: { likes: -1 }
            }
          );
          totalLikesRemoved += updatedImages.modifiedCount;
        }
        deletedItemsCount.likes = totalLikesRemoved;
        console.log(`Removed users from ${totalLikesRemoved} image likes across all user IDs`);
      } catch (error) {
        console.error('Error updating image likes:', error);
        // Continue with other deletions even if this fails
      }
      
      // 4. TODO: Add more cascade deletes here as needed:
      // - User comments/reviews
      // - User download history
      // - User uploaded images (if any)
      // - User favorites/bookmarks
      // - User session data
      // - Any other user-related data
    }

    // Finally delete ALL users with same email (not just the target user)
    let deletedUser = null;
    let deletedAdmin = null;
    let additionalDeletedUsers = 0;
    
    if (userToDelete) {
      // Delete all users with same email
      const allUsersWithSameEmail = await userModel.find({ email: userToDelete.email });
      console.log(`Deleting ${allUsersWithSameEmail.length} users with email ${userToDelete.email}`);
      
      for (const user of allUsersWithSameEmail) {
        await userModel.findByIdAndDelete(user._id);
        if (user._id.toString() === id) {
          deletedUser = user;
        } else {
          additionalDeletedUsers++;
        }
      }
    } else {
      deletedAdmin = await adminModel.findByIdAndDelete(id);
    }

    const deletedData = deletedUser || deletedAdmin;

    return NextResponse.json({
      success: true,
      message: `${userType} deleted successfully`,
      deletedUser: {
        _id: deletedData._id,
        name: deletedData.name,
        email: deletedData.email,
        type: userType.toLowerCase()
      },
      cascadeDeleted: deletedItemsCount,
      details: `Deleted user${additionalDeletedUsers > 0 ? ` and ${additionalDeletedUsers} additional users with same email` : ''} along with ${deletedItemsCount.transactions} transactions, ${deletedItemsCount.orders} orders, and removed from ${deletedItemsCount.likes} image likes`,
      additionalUsersDeleted: additionalDeletedUsers
    });

  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
