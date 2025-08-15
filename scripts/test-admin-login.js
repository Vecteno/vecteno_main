// Test admin login credentials
import connectToDatabase from '../lib/db.js';
import adminModel from '../app/models/adminUserModel.js';
import bcrypt from 'bcryptjs';

async function testAdminLogin() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    const adminEmail = 'purohitpraveen87@gmail.com';
    const adminPassword = 'admin123';
    
    // Find admin user
    const admin = await adminModel.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found');
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
    
    // Test password comparison
    console.log('\n🔐 Testing password comparison...');
    const isPasswordCorrect = await bcrypt.compare(adminPassword, admin.password);
    
    if (isPasswordCorrect) {
      console.log('✅ Password verification SUCCESS!');
      console.log('✅ Admin login should work now');
    } else {
      console.log('❌ Password verification FAILED!');
      console.log('❌ There might be an issue with password hashing');
    }
    
    // Additional debug info
    console.log('\n🔍 Debug Info:');
    console.log(`- Password to test: "${adminPassword}"`);
    console.log(`- Stored hash: ${admin.password}`);
    console.log(`- Hash length: ${admin.password.length}`);
    console.log(`- Hash starts with: ${admin.password.substring(0, 10)}`);
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  } finally {
    process.exit(0);
  }
}

testAdminLogin();
