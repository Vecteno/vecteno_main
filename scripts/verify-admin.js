// Verify admin user exists in database
import connectToDatabase from '../lib/db.js';
import adminModel from '../app/models/adminUserModel.js';

async function verifyAdmin() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    const adminEmail = 'purohitpraveen87@gmail.com';
    
    // Find admin user
    const admin = await adminModel.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('✅ Admin user found in database!');
      console.log('\n📊 Admin Details:');
      console.log(`- ID: ${admin._id}`);
      console.log(`- Name: ${admin.name}`);
      console.log(`- Email: ${admin.email}`);
      console.log(`- Role: ${admin.role}`);
      console.log(`- Password Hash: ${admin.password.substring(0, 20)}...`);
      console.log(`- 2FA Enabled: ${admin.twoFactorEnabled}`);
      console.log(`- Created At: ${admin.createdAt}`);
      console.log(`- Updated At: ${admin.updatedAt}`);
      
      // Check all admins in database
      const allAdmins = await adminModel.find({});
      console.log(`\n📊 Total admins in database: ${allAdmins.length}`);
      
    } else {
      console.log('❌ Admin user not found in database!');
      
      // Check if any admins exist
      const adminCount = await adminModel.countDocuments();
      console.log(`Total admin documents in collection: ${adminCount}`);
      
      if (adminCount > 0) {
        const allAdmins = await adminModel.find({}).select('email name role');
        console.log('Existing admins:');
        allAdmins.forEach(admin => {
          console.log(`- ${admin.email} (${admin.name}, ${admin.role})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error verifying admin user:', error);
  } finally {
    process.exit(0);
  }
}

verifyAdmin();
