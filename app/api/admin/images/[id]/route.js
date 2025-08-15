import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import { uploadFile, deleteFile } from "@/lib/fileUpload";
import { checkAdminAuth } from "@/lib/adminAuth";
import path from 'path';

// GET - Fetch single image by ID
export const GET = async (req, { params }) => {
  try {
    // Check admin authentication
    const { isAuthorized } = await checkAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const { id } = params;
    
    const image = await ImageModel.findById(id);
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, image });
  } catch (err) {
    console.error("Error fetching image:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch image" },
      { status: 500 }
    );
  }
};

// PUT - Update image by ID
export const PUT = async (req, { params }) => {
  try {
    // Check admin authentication
    const { isAuthorized } = await checkAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const { id } = params;
    
    // Check if request is FormData or JSON
    const contentType = req.headers.get('content-type');
    let body;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData (from XHR request)
      const formData = await req.formData();
      body = {
        title: formData.get('title'),
        slug: formData.get('slug'),
        description: formData.get('description'),
        category: formData.get('category'),
        tags: formData.get('tags'),
        type: formData.get('type'),
        isTrending: formData.get('isTrending') === 'true',
        fileTypes: JSON.parse(formData.get('fileTypes') || '[]'),
        orientation: JSON.parse(formData.get('orientation') || '[]'),
        image: formData.get('image'), // New image file
        thumbnail: formData.get('thumbnail'), // New thumbnail file
        downloadFile: formData.get('downloadFile'), // New downloadable file
      };
    } else {
      // Handle JSON
      body = await req.json();
    }
    
    // Get existing image data
    const existingImage = await ImageModel.findById(id);
    if (!existingImage) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    // Handle image replacement if new image is provided
    let imageUrl = existingImage.imageUrl;
    let fileName = existingImage.fileName;
    let thumbnailUrl = existingImage.thumbnailUrl;
    let thumbnailFileName = existingImage.thumbnailFileName;
    let downloadUrl = existingImage.downloadUrl;
    let downloadFileName = existingImage.downloadFileName;
    let downloadFileSize = existingImage.downloadFileSize;
    let downloadFileType = existingImage.downloadFileType;

    if (body.image && body.image instanceof File) {
      try {
        // Delete old image from local storage
        if (existingImage.fileName) {
          const oldImagePath = path.join(process.cwd(), 'uploads', 'images', existingImage.fileName);
          deleteFile(oldImagePath);
        }

        // Upload new image to local storage
        const uploadResponse = await uploadFile(body.image, 'images');
        if (!uploadResponse.success) {
          return NextResponse.json(
            { success: false, error: "Failed to upload image: " + uploadResponse.error },
            { status: 500 }
          );
        }

        imageUrl = uploadResponse.url;
        fileName = uploadResponse.filename;
      } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json(
          { success: false, error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    if (body.thumbnail && body.thumbnail instanceof File) {
      try {
        // Delete old thumbnail from local storage
        if (existingImage.thumbnailFileName) {
          const oldThumbnailPath = path.join(process.cwd(), 'uploads', 'images', existingImage.thumbnailFileName);
          deleteFile(oldThumbnailPath);
        }

        // Upload new thumbnail to local storage
        const uploadResponse = await uploadFile(body.thumbnail, 'images');
        if (!uploadResponse.success) {
          return NextResponse.json(
            { success: false, error: "Failed to upload thumbnail: " + uploadResponse.error },
            { status: 500 }
          );
        }

        thumbnailUrl = uploadResponse.url;
        thumbnailFileName = uploadResponse.filename;
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
        return NextResponse.json(
          { success: false, error: "Failed to upload thumbnail" },
          { status: 500 }
        );
      }
    }

    // Handle downloadable file replacement if new file is provided
    console.log('Download file check:', {
      hasDownloadFile: !!body.downloadFile,
      isFile: body.downloadFile instanceof File,
      fileName: body.downloadFile?.name
    });
    
    if (body.downloadFile && body.downloadFile instanceof File) {
      try {
        // Delete old downloadable file from local storage
        if (existingImage.downloadFileName) {
          const oldDownloadPath = path.join(process.cwd(), 'uploads', 'files', existingImage.downloadFileName);
          deleteFile(oldDownloadPath);
        }

        // Upload new downloadable file to local storage
        const uploadResponse = await uploadFile(body.downloadFile, 'files');
        if (!uploadResponse.success) {
          return NextResponse.json(
            { success: false, error: "Failed to upload downloadable file: " + uploadResponse.error },
            { status: 500 }
          );
        }

        downloadUrl = uploadResponse.url;
        downloadFileName = uploadResponse.filename;
        downloadFileSize = body.downloadFile.size;
        downloadFileType = body.downloadFile.name.split('.').pop().toLowerCase();
      } catch (error) {
        console.error("Error uploading downloadable file:", error);
        return NextResponse.json(
          { success: false, error: "Failed to upload downloadable file" },
          { status: 500 }
        );
      }
    }

    // Extract update data
    const updateData = {
      title: body.title,
      slug: body.slug,
      description: body.description,
      category: body.category,
      tags: typeof body.tags === 'string' ? body.tags.split(",").map((tag) => tag.trim()) : body.tags,
      type: body.type,
      isTrending: body.isTrending,
      fileTypes: body.fileTypes || [],
      orientation: body.orientation || [],
      imageUrl,
      fileName,
      thumbnailUrl,
      thumbnailFileName,
      downloadUrl,
      downloadFileName,
      downloadFileSize,
      downloadFileType,
      updatedAt: new Date(), // Force update timestamp
    };
    
    console.log('Update data:', {
      downloadUrl,
      downloadFileName,
      downloadFileSize,
      downloadFileType
    });

    const updatedImage = await ImageModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedImage) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, image: updatedImage });
  } catch (err) {
    console.error("Error updating image:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update image" },
      { status: 500 }
    );
  }
};
