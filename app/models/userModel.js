import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // made optional
  mobile: { type: Number }, // made optional
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profileImage: {
    type: String,
    default: "/api/uploads/profileImages/default-image.jpg"

  },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date },
  planName: { type: String, default: "Premium Plan" }, // Plan name for subscribers
  createdAt: { type: Date, default: Date.now },

  // Optional fields for password reset
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Date, default: null },

  // Email verification fields
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationOtp: { type: String, default: "" },
  emailVerificationOtpExpireAt: { type: Date, default: null },

  // ✅ Google login support
  isGoogleUser: { type: Boolean, default: false },
});

delete mongoose.connection.models["User"];
const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
