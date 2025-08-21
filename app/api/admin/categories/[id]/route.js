import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import CategoryModel from "@/app/models/Category";
import { checkAdminAuth } from "@/lib/adminAuth";
import { uploadFile } from '@/lib/fileUpload';
import { deleteOldImageForCategories } from '@/lib/imageUtils';

// PUT - Update category
export async function PUT(request, { params }) {
  try {
    const { isAuthorized } = await checkAdminAuth(request);
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await connectToDatabase();
    const { id } = params;
    const formData = await request.formData();
    
    const name = formData.get('name');
    const description = formData.get('description') || '';
    const showAsHomeRaw = formData.get('showAsHome');
    const showAsHome = showAsHomeRaw === 'true' || showAsHomeRaw === true;
    const imageFile = formData.get('image');
    
    const existingCategory = await CategoryModel.findById(id);
    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const duplicateCategory = await CategoryModel.findOne({
      _id: { $ne: id },
      name: name.trim()
    });

    if (duplicateCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    let imagePath = existingCategory.image;
    
    if (imageFile && imageFile.size > 0) {
      // Delete old image if exists
      if (existingCategory.image) {
        await deleteOldImageForCategories(existingCategory.image);
      }
      
      // Upload new image
      const uploadResult = await uploadFile(imageFile, 'categories');
      
      if (uploadResult.success) {
        imagePath = uploadResult.url;
      } else {
        console.error("File upload failed:", uploadResult.error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
    }

    const updateData = {
      name: name.trim(),
      description: description.trim(),
      showAsHome: Boolean(showAsHome),
      image: imagePath
    };
    
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      _id: updatedCategory._id,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
      description: updatedCategory.description,
      image: updatedCategory.image,
      showAsHome: updatedCategory.showAsHome,
      isActive: updatedCategory.isActive,
      order: updatedCategory.order,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(request, { params }) {
  try {
    const { isAuthorized } = await checkAdminAuth(request);
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await connectToDatabase();
    const { id } = params;

    const category = await CategoryModel.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Delete associated image file
    if (category.image) {
      await deleteOldImageForCategories(category.image);
    }

    await CategoryModel.findByIdAndDelete(id);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}


// import { NextResponse } from "next/server";
// import connectToDatabase from "@/lib/db";
// import CategoryModel from "@/app/models/Category";
// import { checkAdminAuth } from "@/lib/adminAuth";
// import { writeFile, unlink } from 'fs/promises';
// import path from 'path';
// import { existsSync } from 'fs';

// // PUT - Update category
// export async function PUT(request, { params }) {
//   console.log('PUT API - Request received for category ID:', params.id);
//   try {
//     // Check admin authentication
//     const { isAuthorized } = await checkAdminAuth(request);
//     if (!isAuthorized) {
//       console.log('PUT API - Authentication failed');
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//       });
//     }
//     console.log('PUT API - Authentication successful');

//     await connectToDatabase();
//     const { id } = params;
//     const formData = await request.formData();
    
//     // Debug: Log all form data entries
//     console.log('Backend - All FormData entries:');
//     for (const [key, value] of formData.entries()) {
//       console.log(`${key}:`, value);
//     }
    
//     const name = formData.get('name');
//     const description = formData.get('description') || '';
//     const showAsHomeRaw = formData.get('showAsHome');
//     const showAsHome = showAsHomeRaw === 'true' || showAsHomeRaw === true;
//     const imageFile = formData.get('image');
    
//     console.log('Backend - Parsed values:');
//     console.log('showAsHomeRaw:', showAsHomeRaw);
//     console.log('showAsHome (boolean):', showAsHome);

//     // Find existing category
//     const existingCategory = await CategoryModel.findById(id);
//     if (!existingCategory) {
//       return NextResponse.json({ error: "Category not found" }, { status: 404 });
//     }

//     // Validate required fields
//     if (!name || name.trim() === '') {
//       return NextResponse.json({ error: "Category name is required" }, { status: 400 });
//     }

//     // Check if another category with same name exists (excluding current category)
//     const duplicateCategory = await CategoryModel.findOne({
//       _id: { $ne: id },
//       name: name.trim()
//     });

//     if (duplicateCategory) {
//       return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
//     }

//     let imagePath = existingCategory.image;
    
//     // Handle file upload if provided
//     if (imageFile && imageFile.size > 0) {
//       const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'categories');
//       const bytes = await imageFile.arrayBuffer();
//       const buffer = Buffer.from(bytes);
      
//       // Generate unique filename
//       const timestamp = Date.now();
//       const originalName = imageFile.name.replace(/\s+/g, '_');
//       const filename = `${timestamp}_${originalName}`;
//       const filePath = path.join(uploadsDir, filename);
      
//       // Delete old image if exists
//       if (existingCategory.image) {
//         const oldImagePath = path.join(process.cwd(), 'public', existingCategory.image);
//         if (existsSync(oldImagePath)) {
//           try {
//             await unlink(oldImagePath);
//           } catch (error) {
//             console.error("Error deleting old image:", error);
//           }
//         }
//       }
      
//       // Write new file
//       await writeFile(filePath, buffer);
//       imagePath = `/uploads/categories/${filename}`;
//     }

//     console.log('Updating category with data:', {
//       id,
//       name: name.trim(),
//       description: description?.trim() || '',
//       showAsHome: showAsHome,
//       image: imagePath
//     });

//     const updateData = {
//       name: name.trim(),
//       description: description.trim(),
//       showAsHome: Boolean(showAsHome),
//       image: imagePath
//     };
    
//     console.log('Backend PUT - Update data:', updateData);
    
//     const updatedCategory = await CategoryModel.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     console.log('Category updated successfully:', updatedCategory);
//     console.log('Backend - Final showAsHome value in response:', updatedCategory.showAsHome);
    
//     // Ensure the response includes all fields
//     const response = {
//       _id: updatedCategory._id,
//       name: updatedCategory.name,
//       slug: updatedCategory.slug,
//       description: updatedCategory.description,
//       image: updatedCategory.image,
//       showAsHome: updatedCategory.showAsHome,
//       isActive: updatedCategory.isActive,
//       order: updatedCategory.order,
//       createdAt: updatedCategory.createdAt,
//       updatedAt: updatedCategory.updatedAt,
//       __v: updatedCategory.__v
//     };
    
//     console.log('Backend - Explicit response object:', response);
//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error updating category:", error);
//     return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
//   }
// }

// // DELETE - Delete category
// export async function DELETE(request, { params }) {
//   try {
//     // Check admin authentication
//     const { isAuthorized } = await checkAdminAuth(request);
//     if (!isAuthorized) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//       });
//     }

//     await connectToDatabase();
//     const { id } = params;

//     // Find category to delete
//     const category = await CategoryModel.findById(id);
//     if (!category) {
//       return NextResponse.json({ error: "Category not found" }, { status: 404 });
//     }

//     // Delete associated image file if exists
//     if (category.image) {
//       const imagePath = path.join(process.cwd(), 'public', category.image);
//       if (existsSync(imagePath)) {
//         try {
//           await unlink(imagePath);
//         } catch (error) {
//           console.error("Error deleting image file:", error);
//         }
//       }
//     }

//     // Delete category from database
//     await CategoryModel.findByIdAndDelete(id);

//     return NextResponse.json({ message: "Category deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting category:", error);
//     return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
//   }
// }
