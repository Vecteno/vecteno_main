import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: String },
  tags: [{ type: String }],
  type: { type: String, enum: ["free", "premium"], default: "free" },
  imageUrl: { type: String, required: true },
  public_id: { type: String },
  thumbnailUrl: { type: String },
  thumbnail_public_id: { type: String },
  // Downloadable file fields
  downloadUrl: { type: String }, // Main downloadable file URL
  download_public_id: { type: String },
  downloadFileName: { type: String },
  downloadFileSize: { type: Number }, // Size in bytes
  downloadFileType: { type: String }, // e.g., "zip", "png", "jpg", etc.
  // Video support fields
  isVideo: { type: Boolean, default: false },
  videoUrl: { type: String },
  video_public_id: { type: String },
  videoDuration: { type: String }, // e.g., "2:30"
  videoThumbnail: { type: String },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isTrending: { type: Boolean, default: false },
  downloads: { type: Number, default: 0 },
  fileTypes: {
    type: [String],
    default: [],
  },
  orientation: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true
});

const ImageModel = mongoose.models.Image || mongoose.model("Image", imageSchema);

export default ImageModel;
