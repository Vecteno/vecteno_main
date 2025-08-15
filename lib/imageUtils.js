import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// Helper function to generate unique filename
const generateUniqueFilename = (originalUrl) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = '.jpg'; // Google profile images are usually JPG
  return `google_profile_${timestamp}_${randomString}${extension}`;
};

// Helper function to ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Download image from URL and save locally
export const downloadAndSaveImage = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    try {
      // Skip if no image URL
      if (!imageUrl) {
        resolve(null);
        return;
      }

      // Define upload directory
      const uploadDir = 'public/uploads/profile-images';
      const fullUploadPath = path.join(process.cwd(), uploadDir);
      
      // Ensure directory exists
      ensureDirectoryExists(fullUploadPath);

      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(imageUrl);
      const filePath = path.join(fullUploadPath, uniqueFilename);

      // Choose appropriate protocol
      const client = imageUrl.startsWith('https:') ? https : http;

      // Download image
      client.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        // Create write stream
        const fileStream = fs.createWriteStream(filePath);

        // Pipe response to file
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          
          // Return local URL
          const localUrl = `/uploads/profile-images/${uniqueFilename}`;
          resolve(localUrl);
        });

        fileStream.on('error', (error) => {
          reject(error);
        });

      }).on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Function to delete old profile image
export const deleteOldImage = (imagePath) => {
  try {
    if (imagePath && imagePath.startsWith('/uploads/profile-images/')) {
      const fullPath = path.join(process.cwd(), 'public', imagePath);
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
