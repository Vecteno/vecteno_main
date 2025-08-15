import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: { 
    type: String,
    trim: true,
    default: ''
  },
  image: { 
    type: String // URL to category image
  },
  imagePublicId: {
    type: String // Cloudinary public ID for the category image
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  showAsHome: {
    type: Boolean,
    default: false,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from name before validation
categorySchema.pre('validate', function(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

const CategoryModel = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default CategoryModel;
