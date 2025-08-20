import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// Helper function to generate unique filename
const generateUniqueFilename = (originalUrl) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalUrl) || '.jpg';
  return `google_profile_${timestamp}_${randomString}${extension}`;
};

// Ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Download image from URL and save to /storage/profileImages
export const downloadAndSaveImage = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    try {
      if (!imageUrl) {
        resolve(null);
        return;
      }

      // Define upload directory in storage
      const uploadDir = path.join(process.cwd(), 'storage', 'profileImages');
      ensureDirectoryExists(uploadDir);

      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(imageUrl);
      const filePath = path.join(uploadDir, uniqueFilename);

      // Choose http/https
      const client = imageUrl.startsWith('https:') ? https : http;

      client.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();

          // Store API URL instead of direct file path
          const localUrl = `/api/uploads/profileImages/${uniqueFilename}`;
          resolve(localUrl);
        });

        fileStream.on('error', reject);
      }).on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};

// Delete old profile image from storage
export const deleteOldImage = (imagePath) => {
  try {
    if (imagePath && imagePath.startsWith('/api/uploads/profileImages/')) {
      const filename = imagePath.replace('/api/uploads/profileImages/', '');
      const fullPath = path.join(process.cwd(), 'storage', 'profileImages', filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error deleting old image:', error);
    return false;
  }
};
