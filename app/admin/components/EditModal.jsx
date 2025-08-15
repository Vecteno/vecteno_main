"use client";
import { useState, useEffect } from "react";
import Modal from "react-modal";
import { FiX, FiSave, FiLoader } from "react-icons/fi";

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

const EditModal = ({ isOpen, onClose, imageId, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    tags: "",
    type: "free",
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
  const [currentImageData, setCurrentImageData] = useState(null);

  const availableFileTypes = ["PNG", "JPG", "SVG", "PDF", "EPS", "AI", "PSD", "CDR", "ZIP"];

  // Load image data when modal opens
  useEffect(() => {
    if (isOpen && imageId) {
      loadImageData();
    }
  }, [isOpen, imageId]);

  const loadImageData = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const config = adminToken ? {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      } : {};

      // Fetch image data
      const imageRes = await fetch(`/api/admin/images/${imageId}`, config);
      const imageData = await imageRes.json();

      if (imageData.success) {
        const img = imageData.image;
        setCurrentImageData(img);
        setForm({
          title: img.title || "",
          slug: img.slug || "",
          description: img.description || "",
          category: img.category || "",
          tags: (img.tags || []).join(", "),
          type: img.type || "free",
          isTrending: img.isTrending || false,
          fileTypes: img.fileTypes || [],
          orientation: img.orientation || [],
        });

        setSeo({
          metaTitle: img.metaTitle || "",
          metaDescription: img.metaDescription || "",
          focusKeywords: img.focusKeywords || "",
        });
      }

      // Fetch categories
      const catRes = await fetch('/api/admin/categories', config);
      const categoryData = await catRes.json();
      if (Array.isArray(categoryData)) {
        setCategories(categoryData);
      }
    } catch (error) {
      console.error('Error loading image data:', error);
      setMessage({ text: "Error loading image details", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (name === "fileTypes" && type === "checkbox") {
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

      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: "Update successful!", type: "success" });
        setTimeout(() => {
          onSave && onSave(data.image);
          onClose();
        }, 1500);
      } else {
        setMessage({ text: data.error || "Update failed.", type: "error" });
      }
    } catch (error) {
      console.error('Error updating image:', error);
      setMessage({ text: "Something went wrong.", type: "error" });
    } finally {
      setSaving(false);
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
    setCurrentImageData(null);
    onClose();
  };

  if (!isOpen) return null;

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
          <h2 className="text-2xl font-bold text-gray-800">Edit Asset</h2>
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6" style={{maxHeight: 'calc(90vh - 160px)'}}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
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
                          Title
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
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
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
                            Category
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
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

                {/* Image Preview */}
                <div className="space-y-4">
                  {currentImageData && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Current Image
                      </h3>
                      <div className="bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={currentImageData.imageUrl}
                          alt={currentImageData.title}
                          className="w-full h-48 object-contain"
                        />
                      </div>
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                        <div><strong>ID:</strong> {currentImageData._id}</div>
                        <div><strong>Type:</strong> {currentImageData.type}</div>
                        <div><strong>Category:</strong> {currentImageData.category}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
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
                const form = document.querySelector('#edit-form');
                if (form) {
                  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditModal;
