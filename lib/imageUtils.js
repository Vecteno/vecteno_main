import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

// Generate unique filename
const generateUniqueFilename = (originalUrl) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalUrl).split("?")[0] || ".jpg";
  return `google_profile_${timestamp}_${randomString}${ext}`;
};

// Ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Download image from Google and save to /storage/profileImages
export const downloadAndSaveImage = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) return resolve(null);

    const uploadDir = path.join(process.cwd(), "storage", "profileImages");
    ensureDirectoryExists(uploadDir);

    const uniqueFilename = generateUniqueFilename(imageUrl);
    const filePath = path.join(uploadDir, uniqueFilename);

    const client = imageUrl.startsWith("https:") ? https : http;

    client.get(imageUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        resolve(`/api/uploads/profileImages/${uniqueFilename}`);
      });

      fileStream.on("error", reject);
    }).on("error", reject);
  });
};

// Delete old profile image from /storage/profileImages
export const deleteOldImage = (imagePath) => {
  try {
    if (imagePath && imagePath.startsWith("/api/uploads/profileImages/")) {
      const filename = path.basename(imagePath);
      const fullPath = path.join(process.cwd(), "storage", "profileImages", filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error deleting old image:", error);
    return false;
  }
};

// NEW: Delete old category image from /storage/categories
export const deleteOldImageForCategories = (imagePath) => {
  try {
    if (imagePath && imagePath.startsWith("/api/uploads/categories/")) {
      const filename = path.basename(imagePath);
      const fullPath = path.join(process.cwd(), "storage", "categories", filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log('Deleted category image:', fullPath);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error deleting category image:", error);
    return false;
  }
};

// import fs from "fs";
// import path from "path";
// import https from "https";
// import http from "http";

// // Generate unique filename
// const generateUniqueFilename = (originalUrl) => {
//   const timestamp = Date.now();
//   const randomString = Math.random().toString(36).substring(2, 15);
//   const ext = path.extname(originalUrl).split("?")[0] || ".jpg";
//   return `google_profile_${timestamp}_${randomString}${ext}`;
// };

// // Ensure directory exists
// const ensureDirectoryExists = (dirPath) => {
//   if (!fs.existsSync(dirPath)) {
//     fs.mkdirSync(dirPath, { recursive: true });
//   }
// };

// // Download image from Google and save to /storage/profileImages
// export const downloadAndSaveImage = async (imageUrl) => {
//   return new Promise((resolve, reject) => {
//     if (!imageUrl) return resolve(null);

//     const uploadDir = path.join(process.cwd(), "storage", "profileImages");
//     ensureDirectoryExists(uploadDir);

//     const uniqueFilename = generateUniqueFilename(imageUrl);
//     const filePath = path.join(uploadDir, uniqueFilename);

//     const client = imageUrl.startsWith("https:") ? https : http;

//     client.get(imageUrl, (response) => {
//       if (response.statusCode !== 200) {
//         reject(new Error(`Failed to download image: ${response.statusCode}`));
//         return;
//       }

//       const fileStream = fs.createWriteStream(filePath);
//       response.pipe(fileStream);

//       fileStream.on("finish", () => {
//         fileStream.close();
//         // ✅ Return correct API URL
//         resolve(`/api/uploads/profileImages/${uniqueFilename}`);
//       });

//       fileStream.on("error", reject);
//     }).on("error", reject);
//   });
// };

// // Delete old profile image from /storage/profileImages
// export const deleteOldImage = (imagePath) => {
//   try {
//     if (imagePath && imagePath.startsWith("/api/uploads/profileImages/")) {
//       const filename = path.basename(imagePath);
//       const fullPath = path.join(process.cwd(), "storage", "profileImages", filename);
//       if (fs.existsSync(fullPath)) {
//         fs.unlinkSync(fullPath);
//         return true;
//       }
//     }
//     return false;
//   } catch (error) {
//     console.error("Error deleting old image:", error);
//     return false;
//   }
// };
