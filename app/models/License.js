// models/License.js
import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema({
  licenseText: {
    type: String,
    required: true,
    default: "Default license text here..."
  }
}, { timestamps: true });

export default mongoose.models.License || mongoose.model("License", licenseSchema);
