import mongoose from "mongoose";

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
    timestamps: true // This adds createdAt and updatedAt fields
});

const adminModel = mongoose.models.admin || mongoose.model('admin', adminSchema);
export default adminModel;
