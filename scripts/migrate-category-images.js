import fs from 'fs';
import path from 'path';

const migrateImages = async () => {
  const oldDir = path.join(process.cwd(), 'public', 'uploads', 'categories');
  const newDir = path.join(process.cwd(), 'storage', 'categories');
  
  console.log('Checking for existing images to migrate...');
  console.log('Source:', oldDir);
  console.log('Destination:', newDir);
  
  // Check if source directory exists
  if (!fs.existsSync(oldDir)) {
    console.log('❌ No existing images found to migrate');
    return;
  }
  
  // Check if source directory is empty
  const files = fs.readdirSync(oldDir);
  if (files.length === 0) {
    console.log('✅ Source directory is empty - no migration needed');
    return;
  }
  
  console.log(`Found ${files.length} files to migrate`);
  
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir, { recursive: true });
    console.log('📁 Created destination directory:', newDir);
  }
  
  // Move files one by one
  let movedCount = 0;
  files.forEach(file => {
    const oldPath = path.join(oldDir, file);
    const newPath = path.join(newDir, file);
    
    if (fs.existsSync(oldPath) && fs.statSync(oldPath).isFile()) {
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Moved: ${file}`);
        movedCount++;
      } catch (error) {
        console.log(`❌ Failed to move ${file}:`, error.message);
      }
    }
  });
  
  console.log(`\n🎉 Migration completed!`);
  console.log(`Moved ${movedCount} out of ${files.length} files`);
  
  // Optional: Remove empty source directory
  if (movedCount === files.length) {
    try {
      fs.rmdirSync(oldDir);
      console.log('🗑️ Removed empty source directory');
    } catch (error) {
      console.log('Note: Could not remove source directory (may not be empty)');
    }
  }
};

// Run the migration
migrateImages().catch(console.error);