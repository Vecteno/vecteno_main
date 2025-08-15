const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://mmdemomail123:demo123@vectenodemo.6wjmcwa.mongodb.net/vecteno?retryWrites=true&w=majority&appName=VectenoDemo');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Admin schema
const adminSchema = new mongoose.Schema({
    name: { type: String, default: "Admin" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    resetOtp: { type: Number },
    resetOtpExpireAt: { type: Number },
    twoFactorEnabled: { type: Boolean, default: false },
    loginOtp: { type: Number },
    loginOtpExpireAt: { type: Number }
}, {
    timestamps: true
});

const AdminModel = mongoose.models.admin || mongoose.model('admin', adminSchema);

// Check 2FA status
const check2FAStatus = async () => {
  await connectDB();
  
  try {
    const admins = await AdminModel.find({});
    console.log('\n📋 All Admin Users:');
    console.log('===================');
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   2FA Enabled: ${admin.twoFactorEnabled}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log('   ---');
    });
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking 2FA status:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

check2FAStatus();
