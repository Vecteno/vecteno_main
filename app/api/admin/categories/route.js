import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import CategoryModel from "@/app/models/Category";
import { checkAdminAuth } from "@/lib/adminAuth";
import { uploadFile } from '@/lib/fileUpload';
import { deleteOldImageForCategories } from '@/lib/imageUtils';

// GET - Fetch all categories
export async function GET(req) {
  try {
    const { isAuthorized } = await checkAdminAuth(req);
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
 
    await connectToDatabase();
    const categories = await CategoryModel.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST - Create new category
export async function POST(request) {
  try {
    const { isAuthorized } = await checkAdminAuth(request);
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await connectToDatabase();
    const formData = await request.formData();
    
    const name = formData.get('name');
    const description = formData.get('description') || '';
    const showAsHomeValue = formData.get('showAsHome');
    const showAsHome = showAsHomeValue === 'true' || showAsHomeValue === true;
    const imageFile = formData.get('image');

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const existingCategory = await CategoryModel.findOne({ name: name.trim() });
    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    let imagePath = null;
    
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadFile(imageFile, 'categories');
      
      if (uploadResult.success) {
        imagePath = uploadResult.url;
      } else {
        console.error("File upload failed:", uploadResult.error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
    }

    const categoryData = {
      name: name.trim(),
      description: description.trim(),
      showAsHome: Boolean(showAsHome),
      image: imagePath
    };
    
    const newCategory = new CategoryModel(categoryData);
    await newCategory.save();
    
    return NextResponse.json({
      _id: newCategory._id,
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description,
      image: newCategory.image,
      showAsHome: newCategory.showAsHome,
      isActive: newCategory.isActive,
      order: newCategory.order,
      createdAt: newCategory.createdAt,
      updatedAt: newCategory.updatedAt,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error.message);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}


// import { NextResponse } from "next/server";
// import connectToDatabase from "@/lib/db";
// import CategoryModel from "@/app/models/Category";
// import { checkAdminAuth } from "@/lib/adminAuth";
// import { writeFile } from 'fs/promises';
// import path from 'path';
// import { existsSync, mkdirSync } from 'fs';

// // Ensure uploads directory exists
// const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'categories');
// if (!existsSync(uploadsDir)) {
//   mkdirSync(uploadsDir, { recursive: true });
// }

// // GET - Fetch all categories
// export async function GET(req) {
//   try {
//     // Check admin authentication
//     const { isAuthorized } = await checkAdminAuth(req);
//     if (!isAuthorized) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//       });
//     }
 
//     await connectToDatabase();
//     const categories = await CategoryModel.find({}).sort({ order: 1, createdAt: -1 });
//     console.log('Backend - Fetched categories with showAsHome:', categories.map(cat => ({ id: cat._id, name: cat.name, showAsHome: cat.showAsHome })));
//     return NextResponse.json(categories);
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
//   }
// }

// // POST - Create new category
// export async function POST(request) {
//   try {
//     // Check admin authentication
//     const { isAuthorized } = await checkAdminAuth(request);
//     if (!isAuthorized) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//       });
//     }

//     await connectToDatabase();
//     const formData = await request.formData();
    
//     const name = formData.get('name');
//     const description = formData.get('description') || '';
//     const showAsHomeValue = formData.get('showAsHome');
//     const showAsHome = showAsHomeValue === 'true' || showAsHomeValue === true;
//     const imageFile = formData.get('image');
    
//     console.log('Backend POST - Raw formData values:');
//     console.log('name:', name);
//     console.log('description:', description);
//     console.log('showAsHomeValue:', showAsHomeValue);
//     console.log('showAsHome (parsed):', showAsHome);

//     // Validate required fields
//     if (!name || name.trim() === '') {
//       return NextResponse.json({ error: "Category name is required" }, { status: 400 });
//     }

//     // Check if category with same name exists
//     const existingCategory = await CategoryModel.findOne({ name: name.trim() });

//     if (existingCategory) {
//       return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
//     }

//     let imagePath = null;
    
//     // Handle file upload if provided
//     if (imageFile && imageFile.size > 0) {
//       const bytes = await imageFile.arrayBuffer();
//       const buffer = Buffer.from(bytes);
      
//       // Generate unique filename
//       const timestamp = Date.now();
//       const originalName = imageFile.name.replace(/\s+/g, '_');
//       const filename = `${timestamp}_${originalName}`;
//       const filePath = path.join(uploadsDir, filename);
      
//       // Write file to public/uploads/categories directory
//       await writeFile(filePath, buffer);
//       imagePath = `/uploads/categories/${filename}`;
//     }

//     console.log('Creating category with data:', {
//       name: name.trim(),
//       description: description?.trim() || '',
//       showAsHome: showAsHome,
//       image: imagePath
//     });

//     const categoryData = {
//       name: name.trim(),
//       description: description.trim(),
//       showAsHome: Boolean(showAsHome),
//       image: imagePath
//     };
    
//     console.log('Backend POST - Creating category with data:', categoryData);
//     const newCategory = new CategoryModel(categoryData);

//     console.log('Category created, now saving...');
//     await newCategory.save();
//     console.log('Category saved successfully:', newCategory);
//     console.log('Backend - Final showAsHome value in create response:', newCategory.showAsHome);
    
//     // Ensure the response includes all fields
//     const response = {
//       _id: newCategory._id,
//       name: newCategory.name,
//       slug: newCategory.slug,
//       description: newCategory.description,
//       image: newCategory.image,
//       showAsHome: newCategory.showAsHome,
//       isActive: newCategory.isActive,
//       order: newCategory.order,
//       createdAt: newCategory.createdAt,
//       updatedAt: newCategory.updatedAt,
//       __v: newCategory.__v
//     };
    
//     console.log('Backend - Explicit create response object:', response);
//     return NextResponse.json(response, { status: 201 });
//   } catch (error) {
//     console.error("Error creating category:", error.message);
//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map(val => val.message);
//       return NextResponse.json({ error: "Validation Error: " + messages.join(', ') }, { status: 400 });
//     } else {
//       return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
//     }
//   }
// }
