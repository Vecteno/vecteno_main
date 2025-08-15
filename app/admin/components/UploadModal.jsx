"use client";
import { useState, useEffect } from "react";
import Modal from "react-modal";
import { FiX, FiSave, FiLoader, FiUpload } from "react-icons/fi";

// Custom slugify function
const customSlugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

const UploadModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    tags: "",
    type: "free",
    thumbnail: null,
    downloadFile: null,
    isTrending: false,
    fileTypes: [],
    orientation: [],
  });

  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    focusKeywords: "",
  });

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [categories, setCategories] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const availableFileTypes = ["PNG", "JPG", "SVG", "PDF", "EPS", "AI", "PSD", "CDR", "ZIP"];

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const config = adminToken ? {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      } : {};

      const catRes = await fetch('/api/admin/categories', config);
      const categoryData = await catRes.json();
      if (Array.isArray(categoryData)) {
        setCategories(categoryData);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files, checked, type } = e.target;

    if (files) {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));

      if (name === "thumbnail") {
        setThumbnailPreview(URL.createObjectURL(file));
      }
    } else if (name === "fileTypes" && type === "checkbox") {
      setForm((prev) => {
        const currentFileTypes = prev.fileTypes;
        if (checked) {
          return { ...prev, fileTypes: [...currentFileTypes, value] };
        } else {
          return { ...prev, fileTypes: currentFileTypes.filter((item) => item !== value) };
        }
      });
    } else if (name === "orientation" && type === "checkbox") {
      setForm((prev) => {
        const currentOrientations = prev.orientation;
        if (checked) {
          return { ...prev, orientation: [...currentOrientations, value] };
        } else {
          return { ...prev, orientation: currentOrientations.filter((item) => item !== value) };
        }
      });
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSlugChange = (e) => {
    const { value } = e.target;
    const newSlug = value ? customSlugify(value) : "";
    setForm((prev) => ({ ...prev, slug: newSlug }));
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setSeo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    setUploadProgress(0);

    try {
      const adminToken = localStorage.getItem('adminToken');
      const formData = new FormData();

      // Add form data
      for (let key in form) {
        if (Array.isArray(form[key])) {
          formData.append(key, JSON.stringify(form[key]));
        } else if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      }

      // Add SEO data
      for (let key in seo) {
        formData.append(key, seo[key]);
      }

      formData.append("slug", form.slug || customSlugify(form.title));

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);
      
      if (adminToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${adminToken}`);
      }

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            setMessage({ text: "Upload successful!", type: "success" });
            setTimeout(() => {
              onSave && onSave(data.image);
              handleClose();
            }, 1500);
          } else {
            setMessage({ text: data.error || "Upload failed.", type: "error" });
          }
        } else {
          setMessage({ text: "Server Error.", type: "error" });
        }
        setUploadProgress(0);
        setSaving(false);
      };

      xhr.onerror = function () {
        setMessage({ text: "Something went wrong.", type: "error" });
        setUploadProgress(0);
        setSaving(false);
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ text: "Something went wrong.", type: "error" });
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setForm({
      title: "",
      slug: "",
      description: "",
      category: "",
      tags: "",
      type: "free",
      thumbnail: null,
      downloadFile: null,
      isTrending: false,
      fileTypes: [],
      orientation: [],
    });
    setSeo({
      metaTitle: "",
      metaDescription: "",
      focusKeywords: "",
    });
    setActiveTab("general");
    setMessage({ text: "", type: "" });
    setThumbnailPreview(null);
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  const permalink = `https://vecteno.com/products/${form.slug || "your-product-slug"}`;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
      ariaHideApp={false}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Upload New Asset</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Message - Fixed */}
        {message.text && (
          <div className={`mx-6 mt-4 p-4 rounded-lg flex-shrink-0 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="mx-6 mt-4 flex-shrink-0">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6" style={{maxHeight: 'calc(90vh - 180px)'}}>
          <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                className={`py-3 px-6 text-lg font-medium ${
                  activeTab === "general"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("general")}
              >
                General
              </button>
              <button
                type="button"
                className={`py-3 px-6 text-lg font-medium ${
                  activeTab === "seo"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("seo")}
              >
                SEO
              </button>
              <button
                type="button"
                className={`py-3 px-6 text-lg font-medium ${
                  activeTab === "advanced"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("advanced")}
              >
                Advanced
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                {activeTab === "general" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Slug
                      </label>
                      <input
                        name="slug"
                        value={form.slug}
                        onChange={handleSlugChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {form.slug && (
                        <p className="text-sm text-gray-500 mt-1">
                          <strong>Permalink:</strong> <span className="text-blue-600">{permalink}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tags (comma separated)
                      </label>
                      <input
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="e.g., graphic design, vector, template"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isTrending"
                        checked={form.isTrending}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-gray-700 cursor-pointer">
                        Mark as Trending
                      </label>
                    </div>
                  </>
                )}

                {activeTab === "seo" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Meta Title
                      </label>
                      <input
                        name="metaTitle"
                        value={seo.metaTitle}
                        onChange={handleSeoChange}
                        placeholder="SEO Title (50-60 characters)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        name="metaDescription"
                        value={seo.metaDescription}
                        onChange={handleSeoChange}
                        placeholder="SEO Description (150-160 characters)"
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Focus Keywords
                      </label>
                      <input
                        name="focusKeywords"
                        value={seo.focusKeywords}
                        onChange={handleSeoChange}
                        placeholder="Comma-separated keywords"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* SEO Preview */}
                    <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <h3 className="text-md font-semibold mb-2 text-blue-800">
                        SEO Preview
                      </h3>
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                        <p className="text-blue-700 text-lg font-medium truncate">
                          {seo.metaTitle || form.title || "Your Asset Title"}
                        </p>
                        <p className="text-green-700 text-sm mt-1 truncate">
                          {permalink}
                        </p>
                        <p className="text-gray-700 text-sm mt-1 line-clamp-2">
                          {seo.metaDescription || form.description || "Your asset description will appear here..."}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "advanced" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        File Types
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableFileTypes.map((fileType) => (
                          <div key={fileType} className="flex items-center">
                            <input
                              type="checkbox"
                              name="fileTypes"
                              value={fileType}
                              checked={form.fileTypes.includes(fileType)}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                              {fileType}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Orientation
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Portrait", "Landscape", "Square"].map((orientation) => (
                          <div key={orientation} className="flex items-center">
                            <input
                              type="checkbox"
                              name="orientation"
                              value={orientation}
                              checked={form.orientation.includes(orientation)}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                              {orientation}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thumbnail Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors relative">
                    {thumbnailPreview ? (
                      <div className="space-y-2">
                        <img src={thumbnailPreview} alt="Thumbnail" className="mx-auto h-32 object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailPreview(null);
                            setForm(prev => ({ ...prev, thumbnail: null }));
                          }}
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload thumbnail image
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      name="thumbnail"
                      onChange={handleChange}
                      accept="image/*"
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Download File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Download File (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors relative">
                    {form.downloadFile ? (
                      <div className="space-y-2">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{form.downloadFile.name}</p>
                          <p className="text-xs text-gray-500">{Math.round(form.downloadFile.size / 1024)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, downloadFile: null }))}
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-1 text-xs text-gray-600">
                          Upload download file
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      name="downloadFile"
                      onChange={handleChange}
                      accept=".zip,.png,.jpg,.jpeg,.svg,.pdf,.eps,.ai,.psd,.cdr"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer - Fixed at bottom */}
        <div className="border-t border-gray-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector('#upload-form');
                if (form) {
                  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Upload Asset
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;
