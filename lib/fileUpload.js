import fs from 'fs';
import path from 'path';

// Helper function to generate unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);
  return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
};

// Helper function to ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Function to delete file
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    console.error('File deletion error:', error);
    return { success: false, error: error.message };
  }
};

// Main upload function
export const uploadFile = async (file, type = 'images', subfolder = '') => {
  try {
    if (!file || !file.name) {
      throw new Error('Invalid file provided');
    }

    // Base storage directory
    const storageBaseDir = path.join(process.cwd(), 'storage');

    // Define upload directories inside storage
    const uploadDirs = {
      images: path.join(storageBaseDir, 'images'),
      thumbnails: path.join(storageBaseDir, 'thumbnails'),
      files: path.join(storageBaseDir, 'files'),
      downloads: path.join(storageBaseDir, 'downloads'),
      profileImages: path.join(storageBaseDir, 'profileImages'),
      productFiles: path.join(storageBaseDir, 'product-files'),
      categories: path.join(storageBaseDir, 'categories', subfolder),
    };

    const uploadDir = uploadDirs[type] || uploadDirs.images;

    // Ensure directory exists
    ensureDirectoryExists(uploadDir);

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = path.join(uploadDir, uniqueFilename);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write file to disk
    fs.writeFileSync(filePath, buffer);

    // URL for accessing via API
    const url = `/api/uploads/${type}${subfolder ? '/' + subfolder : ''}/${uniqueFilename}`;

    return {
      success: true,
      url,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};






// import fs from 'fs';
// import path from 'path';

// // Helper function to generate unique filename
// const generateUniqueFilename = (originalName) => {
//   const timestamp = Date.now();
//   const randomString = Math.random().toString(36).substring(2, 15);
//   const extension = path.extname(originalName);
//   const nameWithoutExt = path.basename(originalName, extension);
//   return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
// };

// // Helper function to ensure directory exists
// const ensureDirectoryExists = (dirPath) => {
//   if (!fs.existsSync(dirPath)) {
//     fs.mkdirSync(dirPath, { recursive: true });
//   }
// };

// // Main upload function
// export const uploadFile = async (file, type = 'images') => {
//   try {
//     if (!file || !file.name) {
//       throw new Error('Invalid file provided');
//     }

//     // Base storage directory
//     const storageBaseDir = path.join(process.cwd(), 'storage');

//     // Define upload directories inside storage
//     const uploadDirs = {
//       images: path.join(storageBaseDir, 'images'),
//       thumbnails: path.join(storageBaseDir, 'thumbnails'),
//       files: path.join(storageBaseDir, 'files'),
//       downloads: path.join(storageBaseDir, 'downloads'),
//       profileImages: path.join(storageBaseDir, 'profileImages'),
//       productFiles: path.join(storageBaseDir, 'product-files'),
//       categories: path.join(storageBaseDir, 'categories'),
//     };

//     const uploadDir = uploadDirs[type] || uploadDirs.images;

//     // Ensure directory exists
//     ensureDirectoryExists(uploadDir);

//     // Generate unique filename
//     const uniqueFilename = generateUniqueFilename(file.name);
//     const filePath = path.join(uploadDir, uniqueFilename);

//     // Convert file to buffer
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Write file to disk
//     fs.writeFileSync(filePath, buffer);

//     // URL for accessing via API
//     const url = `/api/uploads/${type}/${uniqueFilename}`;

//     return {
//       success: true,
//       url, // API URL for serving the file
//       filename: uniqueFilename,
//       originalName: file.name,
//       size: file.size,
//       type: file.type,
//       path: filePath, // Full system path
//     };

//   } catch (error) {
//     console.error('File upload error:', error);
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// };

// // Function to delete file
// export const deleteFile = (filePath) => {
//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//       return { success: true };
//     }
//     return { success: false, error: 'File not found' };
//   } catch (error) {
//     console.error('File deletion error:', error);
//     return { success: false, error: error.message };
//   }
// };

// // Function to get file info
// export const getFileInfo = (filePath) => {
//   try {
//     if (fs.existsSync(filePath)) {
//       const stats = fs.statSync(filePath);
//       return {
//         success: true,
//         size: stats.size,
//         createdAt: stats.birthtime,
//         modifiedAt: stats.mtime,
//       };
//     }
//     return { success: false, error: 'File not found' };
//   } catch (error) {
//     console.error('Get file info error:', error);
//     return { success: false, error: error.message };
//   }
// };



