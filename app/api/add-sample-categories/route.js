import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";

export async function POST() {
  try {
    await connectToDatabase();

    // Sample data for 5 new categories
    const sampleImages = [
      {
        title: "Modern Logo Design",
        slug: "modern-logo-design-1",
        description: "Professional logo design for modern businesses",
        category: "Logo Design",
        tags: ["logo", "branding", "modern", "professional"],
        type: "premium",
        imageUrl: "https://placehold.co/800x600/6366F1/FFFFFF?text=Modern+Logo+Design",
        thumbnailUrl: "https://placehold.co/400x300/6366F1/FFFFFF?text=Logo",
        likes: 45,
        isTrending: true
      },
      {
        title: "Minimalist Logo",
        slug: "minimalist-logo-1",
        description: "Clean and simple logo design",
        category: "Logo Design",
        tags: ["logo", "minimalist", "clean", "simple"],
        type: "free",
        imageUrl: "https://placehold.co/800x600/10B981/FFFFFF?text=Minimalist+Logo",
        thumbnailUrl: "https://placehold.co/400x300/10B981/FFFFFF?text=Logo",
        likes: 32,
        isTrending: false
      },
      {
        title: "Corporate Presentation",
        slug: "corporate-presentation-1",
        description: "Professional presentation template for business meetings",
        category: "Presentations",
        tags: ["presentation", "corporate", "business", "professional"],
        type: "premium",
        imageUrl: "https://placehold.co/800x600/3B82F6/FFFFFF?text=Corporate+Presentation",
        thumbnailUrl: "https://placehold.co/400x300/3B82F6/FFFFFF?text=Presentation",
        likes: 67,
        isTrending: true
      },
      {
        title: "Creative Presentation",
        slug: "creative-presentation-1",
        description: "Creative and engaging presentation design",
        category: "Presentations",
        tags: ["presentation", "creative", "engaging", "modern"],
        type: "free",
        imageUrl: "https://placehold.co/800x600/8B5CF6/FFFFFF?text=Creative+Presentation",
        thumbnailUrl: "https://placehold.co/400x300/8B5CF6/FFFFFF?text=Presentation",
        likes: 28,
        isTrending: false
      },
      {
        title: "Product Catalog",
        slug: "product-catalog-1",
        description: "Professional product catalog design",
        category: "Catalogs",
        tags: ["catalog", "product", "professional", "business"],
        type: "premium",
        imageUrl: "https://placehold.co/800x600/F59E0B/FFFFFF?text=Product+Catalog",
        thumbnailUrl: "https://placehold.co/400x300/F59E0B/FFFFFF?text=Catalog",
        likes: 89,
        isTrending: true
      },
      {
        title: "Fashion Catalog",
        slug: "fashion-catalog-1",
        description: "Elegant fashion catalog design",
        category: "Catalogs",
        tags: ["catalog", "fashion", "elegant", "style"],
        type: "free",
        imageUrl: "https://placehold.co/800x600/EC4899/FFFFFF?text=Fashion+Catalog",
        thumbnailUrl: "https://placehold.co/400x300/EC4899/FFFFFF?text=Catalog",
        likes: 56,
        isTrending: false
      },
      {
        title: "Restaurant Menu",
        slug: "restaurant-menu-1",
        description: "Beautiful restaurant menu design",
        category: "Menus",
        tags: ["menu", "restaurant", "food", "elegant"],
        type: "premium",
        imageUrl: "https://placehold.co/800x600/EF4444/FFFFFF?text=Restaurant+Menu",
        thumbnailUrl: "https://placehold.co/400x300/EF4444/FFFFFF?text=Menu",
        likes: 123,
        isTrending: true
      },
      {
        title: "Cafe Menu",
        slug: "cafe-menu-1",
        description: "Cozy cafe menu design",
        category: "Menus",
        tags: ["menu", "cafe", "cozy", "warm"],
        type: "free",
        imageUrl: "https://placehold.co/800x600/84CC16/FFFFFF?text=Cafe+Menu",
        thumbnailUrl: "https://placehold.co/400x300/84CC16/FFFFFF?text=Menu",
        likes: 78,
        isTrending: false
      },
      {
        title: "Event Calendar",
        slug: "event-calendar-1",
        description: "Professional event calendar design",
        category: "Calendars",
        tags: ["calendar", "event", "professional", "organized"],
        type: "premium",
        imageUrl: "https://placehold.co/800x600/06B6D4/FFFFFF?text=Event+Calendar",
        thumbnailUrl: "https://placehold.co/400x300/06B6D4/FFFFFF?text=Calendar",
        likes: 94,
        isTrending: true
      },
      {
        title: "Monthly Calendar",
        slug: "monthly-calendar-1",
        description: "Clean monthly calendar template",
        category: "Calendars",
        tags: ["calendar", "monthly", "clean", "simple"],
        type: "free",
        imageUrl: "https://placehold.co/800x600/6B7280/FFFFFF?text=Monthly+Calendar",
        thumbnailUrl: "https://placehold.co/400x300/6B7280/FFFFFF?text=Calendar",
        likes: 45,
        isTrending: false
      }
    ];

    // Check if images already exist to avoid duplicates
    const existingSlugs = await ImageModel.find({
      slug: { $in: sampleImages.map(img => img.slug) }
    }).select('slug');

    const existingSlugSet = new Set(existingSlugs.map(img => img.slug));
    const newImages = sampleImages.filter(img => !existingSlugSet.has(img.slug));

    if (newImages.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All sample categories already exist in the database"
      });
    }

    // Insert new images
    const insertedImages = await ImageModel.insertMany(newImages);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${insertedImages.length} new sample images with 5 new categories`,
      categories: [
        "Logo Design",
        "Presentations", 
        "Catalogs",
        "Menus",
        "Calendars"
      ],
      images: insertedImages
    });

  } catch (error) {
    console.error("Error adding sample categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add sample categories", error: error.message },
      { status: 500 }
    );
  }
} 