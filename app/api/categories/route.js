import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import CategoryModel from "@/app/models/Category";
import ImageModel from "@/app/models/Image";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get categories from CategoryModel
    const dbCategories = await CategoryModel.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .select('name slug description image showAsHome');
    
    // Get product counts for each category from ImageModel
    const categoryCounts = await ImageModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Create a map for quick lookup of counts
    const countMap = {};
    categoryCounts.forEach(item => {
      countMap[item._id] = item.count;
    });
    
    // Debug: Log the raw categories from database
    console.log('Raw categories from DB:', dbCategories.map(cat => ({ name: cat.name, image: cat.image })));
    
    // Format categories for frontend
    const validCategories = dbCategories.map((cat, index) => {
      let imageUrl;
      
      console.log(`Processing category: ${cat.name}, image: ${cat.image}`);
      
      if (cat.image) {
        // If image starts with http, use it directly
        if (cat.image.startsWith('http')) {
          imageUrl = cat.image;
        } else {
          // For local uploads, serve directly from public folder
          // Database stores: '/uploads/categories/filename.jpg'
          // We serve: '/uploads/categories/filename.jpg' (directly from public)
          if (cat.image.startsWith('/uploads/')) {
            imageUrl = cat.image; // Use as-is, served from public folder
          } else if (cat.image.startsWith('uploads/')) {
            imageUrl = `/${cat.image}`; // Add leading slash
          } else {
            // Assume it's just filename, add full path
            imageUrl = `/uploads/categories/${cat.image}`;
          }
        }
      } else {
        // Fallback placeholder
        imageUrl = `https://placehold.co/400x400/4F46E5/FFFFFF?text=${encodeURIComponent(cat.name)}`;
      }
      
      console.log(`Final imageUrl for ${cat.name}: ${imageUrl}`);
      
      return {
        id: index + 1,
        label: cat.name,
        slug: cat.slug,
        image: imageUrl,
        count: `${countMap[cat.name] || 0}+`,
        description: cat.description || `${cat.name} designs and templates`,
        showAsHome: cat.showAsHome || false
      };
    });

    return NextResponse.json({
      success: true,
      categories: validCategories
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
} 