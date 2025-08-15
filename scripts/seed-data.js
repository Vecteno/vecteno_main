// Sample data seeding script
import connectToDatabase from '../lib/db.js';
import ImageModel from '../app/models/Image.js';
import OfferModel from '../app/models/offerModel.js';

const sampleImages = [
  {
    title: "Modern Business Card Design",
    description: "Professional business card template",
    category: "Business Cards",
    slug: "modern-business-card-design",
    imageUrl: "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=300",
    tags: ["business", "card", "professional", "modern"],
    likes: 45,
    type: "free",
    isTrending: true
  },
  {
    title: "Social Media Post Template",
    description: "Instagram post template for social media",
    category: "Social Media",
    slug: "social-media-post-template",
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300",
    tags: ["social", "media", "instagram", "post"],
    likes: 78,
    type: "premium",
    isTrending: true
  },
  {
    title: "Wedding Invitation Design",
    description: "Elegant wedding invitation template",
    category: "Invitations",
    slug: "wedding-invitation-design",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300",
    tags: ["wedding", "invitation", "elegant", "design"],
    likes: 92,
    type: "free",
    isTrending: true
  },
  {
    title: "Product Mockup Bundle",
    description: "Professional product mockup templates",
    category: "Mockups",
    slug: "product-mockup-bundle",
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300",
    tags: ["mockup", "product", "bundle", "professional"],
    likes: 134,
    type: "premium",
    isTrending: true
  },
  {
    title: "Festival Poster Design",
    description: "Colorful festival poster template",
    category: "Festival",
    slug: "festival-poster-design",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300",
    tags: ["festival", "poster", "colorful", "event"],
    likes: 67,
    type: "free",
    isTrending: false
  },
  {
    title: "Corporate Brochure",
    description: "Modern corporate brochure template",
    category: "Brochures",
    slug: "corporate-brochure-template",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    tags: ["brochure", "corporate", "business", "modern"],
    likes: 56,
    type: "premium",
    isTrending: false
  },
  {
    title: "Logo Design Collection",
    description: "Professional logo design templates",
    category: "Logo Design",
    slug: "logo-design-collection",
    imageUrl: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=300",
    tags: ["logo", "design", "professional", "collection"],
    likes: 89,
    type: "free",
    isTrending: false
  },
  {
    title: "Menu Design Template",
    description: "Restaurant menu design template",
    category: "Menus",
    slug: "restaurant-menu-template",
    imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300",
    tags: ["menu", "restaurant", "food", "design"],
    likes: 43,
    type: "free",
    isTrending: false
  },
  {
    title: "Creative Poster Design",
    description: "Innovative poster design template",
    category: "Posters",
    slug: "creative-poster-design",
    imageUrl: "https://images.unsplash.com/photo-1607082348823-0a96f2a4b9da?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1607082348823-0a96f2a4b9da?w=300",
    tags: ["creative", "poster", "design"],
    likes: 120,
    type: "premium",
    isTrending: true
  },
  {
    title: "Amazing Flyer Design",
    description: "Attractive flyer template",
    category: "Flyers",
    slug: "amazing-flyer-design",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300",
    tags: ["amazing", "flyer", "attractive"],
    likes: 95,
    type: "free",
    isTrending: true
  },
  {
    title: "Elegant Brochure Template",
    description: "Stylish brochure design",
    category: "Brochures",
    slug: "elegant-brochure-template",
    imageUrl: "https://images.unsplash.com/photo-1589478569987-3ee17c6d02d9?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1589478569987-3ee17c6d02d9?w=300",
    tags: ["elegant", "brochure", "stylish"],
    likes: 85,
    type: "premium",
    isTrending: true
  },
  {
    title: "Dynamic Banner Set",
    description: "Vibrant banner templates",
    category: "Banners",
    slug: "dynamic-banner-set",
    imageUrl: "https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=300",
    tags: ["dynamic", "banner", "vibrant"],
    likes: 102,
    type: "free",
    isTrending: true
  },
  {
    title: "Innovative Logo Pack",
    description: "Modern logo designs",
    category: "Logos",
    slug: "innovative-logo-pack",
    imageUrl: "https://images.unsplash.com/photo-1617926765097-3e828d6faff9?w=500",
    thumbnailUrl: "https://images.unsplash.com/photo-1617926765097-3e828d6faff9?w=300",
    tags: ["innovative", "logo", "modern"],
    likes: 110,
    type: "premium",
    isTrending: true
  }
];

const sampleOffers = [
  {
    title: "50% Off Premium Templates",
    description: "Get 50% discount on all premium templates. Limited time offer!",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600",
    imagePublicId: "sample_offer_1",
    discountPercent: 50,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true
  }
];

async function seedData() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    console.log('Clearing existing data...');
    await ImageModel.deleteMany({});
    await OfferModel.deleteMany({});
    
    console.log('Seeding images...');
    const createdImages = await ImageModel.insertMany(sampleImages);
    console.log(`✅ Created ${createdImages.length} sample images`);
    
    console.log('Seeding offers...');
    const createdOffers = await OfferModel.insertMany(sampleOffers);
    console.log(`✅ Created ${createdOffers.length} sample offers`);
    
    console.log('🎉 Sample data seeded successfully!');
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`- Images: ${createdImages.length}`);
    console.log(`- Trending Images: ${createdImages.filter(img => img.isTrending).length}`);
    console.log(`- Premium Images: ${createdImages.filter(img => img.type === 'premium').length}`);
    console.log(`- Free Images: ${createdImages.filter(img => img.type === 'free').length}`);
    console.log(`- Active Offers: ${createdOffers.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

seedData();
