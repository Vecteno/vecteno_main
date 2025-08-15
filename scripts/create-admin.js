// Admin user creation script
import connectToDatabase from '../lib/db.js';
import adminModel from '../app/models/adminUserModel.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    const adminEmail = 'purohitpraveen87@gmail.com';
    const adminPassword = 'admin123';
    
    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('❌ Admin user already exists with this email!');
      return;
    }
    
    // Hash the password
    console.log('Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    // Create admin user
    console.log('Creating admin user...');
    const newAdmin = new adminModel({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      twoFactorEnabled: false
    });
    
    const savedAdmin = await newAdmin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('\n📊 Admin Details:');
    console.log(`- Name: ${savedAdmin.name}`);
    console.log(`- Email: ${savedAdmin.email}`);
    console.log(`- Role: ${savedAdmin.role}`);
    console.log(`- Created At: ${savedAdmin.createdAt}`);
    console.log(`- User ID: ${savedAdmin._id}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
