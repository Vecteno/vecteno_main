"use client";
import { useState, useEffect } from "react";
import axios from "axios";

// Custom slugify function to replace the external library
const customSlugify = (text) => {
  if (!text) return "";
  return text
    .toString() // Ensure it's a string
    .normalize("NFD") // Split accented characters into base character and diacritic
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritic marks
    .toLowerCase() // Convert to lowercase
    .trim() // Trim leading/trailing whitespace
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove all non-word chars (except hyphens)
    .replace(/--+/g, "-"); // Replace multiple hyphens with a single hyphen
};

export default function UploadPage() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    tags: "",
    type: "free",
    thumbnail: null,
    image: null,
    isTrending: false,
    fileTypes: [], // Array to store multiple selected file types (now checkboxes)
    orientation: [], // Array for multiple selections via checkboxes
  });

  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    focusKeywords: "",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [imagePreview, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" }); // For custom alerts
  const [activeTab, setActiveTab] = useState("general"); // State to manage active tab
  const [categories, setCategories] = useState([]); // State for dynamic categories

  // Effect to automatically generate slug from title
  useEffect(() => {
    if (form.title && !form.slug) {
      setForm((prev) => ({
        ...prev,
        slug: customSlugify(form.title),
      }));
    }
  }, [form.title, form.slug]);

  // Effect to update SEO meta title and description based on form fields initially
  useEffect(() => {
    setSeo((prev) => ({
      ...prev,
      metaTitle: form.title || "",
      metaDescription: form.description || "",
    }));
  }, [form.title, form.description]);

  // Effect to fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const config = token ? {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        } : {};
        
        const response = await axios.get("/api/admin/categories", config);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (error.response?.status === 401) {
          setMessage({ text: 'Authentication failed. Please login again.', type: 'error' });
          localStorage.removeItem('adminToken');
          // Optionally redirect to login
          // window.location.href = '/admin/login';
        } else {
          setMessage({ text: 'Error loading categories', type: 'error' });
        }
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files, checked, type } = e.target; // Removed 'options' as it's no longer used for fileTypes

    if (files) {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));

      if (name === "thumbnail") {
        setThumbnailPreview(URL.createObjectURL(file));
      } else if (name === "image") {
        setImage(URL.createObjectURL(file));
      }
    } else if (name === "fileTypes" && type === "checkbox") {
      // Handle multi-select for file types (checkboxes)
      setForm((prev) => {
        const currentFileTypes = prev.fileTypes;
        if (checked) {
          // Add the value if checked and not already present
          return { ...prev, fileTypes: [...currentFileTypes, value] };
        } else {
          // Remove the value if unchecked
          return { ...prev, fileTypes: currentFileTypes.filter((item) => item !== value) };
        }
      });
    } else if (name === "orientation" && type === "checkbox") {
      // Handle multi-select for orientation (checkboxes)
      setForm((prev) => {
        const currentOrientations = prev.orientation;
        if (checked) {
          // Add the value if checked and not already present
          return { ...prev, orientation: [...currentOrientations, value] };
        } else {
          // Remove the value if unchecked
          return { ...prev, orientation: currentOrientations.filter((item) => item !== value) };
        }
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSlugChange = (e) => {
    const { value } = e.target;
    // Allow slug to be cleared for auto-generation, or format manual input
    const newSlug = value ? customSlugify(value) : "";
    setForm((prev) => ({ ...prev, slug: newSlug }));
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setSeo((prev) => ({ ...prev, [name]: value }));
  };

  // Function to calculate a simple SEO score
  const calculateSeoScore = () => {
    let score = 0;
    const { metaTitle, metaDescription, focusKeywords } = seo;
    const keywordsArray = focusKeywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    // Basic presence checks
    if (metaTitle.length > 0) score += 10;
    if (metaDescription.length > 0) score += 10;
    if (keywordsArray.length > 0) score += 10;

    // Title length
    if (metaTitle.length >= 30 && metaTitle.length <= 60) score += 20;
    else if (metaTitle.length > 0) score += 10; // Some points for non-optimal length

    // Description length
    if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 20;
    else if (metaDescription.length > 0) score += 10; // Some points for non-optimal length

    // Focus keyword in title
    if (keywordsArray.some((keyword) => metaTitle.toLowerCase().includes(keyword))) {
      score += 15;
    }

    // Focus keyword in description
    if (keywordsArray.some((keyword) => metaDescription.toLowerCase().includes(keyword))) {
      score += 15;
    }

    // Cap score at 100
    return Math.min(score, 100);
  };

  const seoScore = calculateSeoScore();

  const getSeoScoreColor = (score) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Function to highlight keywords in text
  const highlightKeywords = (text, keywordsString) => {
    if (!text || !keywordsString) return { __html: text };

    const keywords = keywordsString
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    let highlightedText = text;
    keywords.forEach((keyword) => {
      if (keyword) {
        // Create a regex for global, case-insensitive replacement
        const regex = new RegExp(`(${keyword})`, "gi");
        highlightedText = highlightedText.replace(regex, `<strong>$1</strong>`);
      }
    });
    return { __html: highlightedText };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    for (let key in form) {
      // For arrays (like fileTypes and orientation), stringify for backend
      if (Array.isArray(form[key])) {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    }

    // Append SEO data
    for (let key in seo) {
      formData.append(key, seo[key]);
    }

    // Ensure slug is appended even if empty (for auto-generation on backend if needed)
    formData.append(
      "slug",
      form.slug || customSlugify(form.title)
    );

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);

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
          setForm({
            title: "",
            slug: "",
            description: "",
            category: "",
            tags: "",
            type: "free",
            thumbnail: null,
            image: null,
            isTrending: false,
            fileTypes: [],
            orientation: [], // Reset to empty array
          });
          setSeo({
            metaTitle: "",
            metaDescription: "",
            focusKeywords: "",
          });
          setThumbnailPreview(null);
          setImage(null);
          setUploadProgress(0);
        } else {
          setMessage({ text: "Upload failed.", type: "error" });
          setUploadProgress(0);
        }
      } else {
        setMessage({ text: "Server Error.", type: "error" });
        setUploadProgress(0);
      }
    };

    xhr.onerror = function () {
      setMessage({ text: "Something went wrong.", type: "error" });
      setUploadProgress(0);
    };

    xhr.send(formData);
  };

  const permalink = `https://vecteno.com/products/${form.slug || "your-product-slug"}`;

  // Define available file types
  const availableFileTypes = ["PNG", "JPG", "SVG", "PDF", "EPS", "AI", "PSD", "CDR", "ZIP"];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {message.text && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-4 font-bold">X</button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Upload New Asset
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10">
        {/* Left Column: Tabs and Content */}
        <div className="flex-1">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
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

          {/* Tab Content: General */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                Title
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                placeholder="Enter title for your asset"
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <label htmlFor="slug" className="block text-sm font-semibold text-gray-700">
                Permalink Slug (Editable)
              </label>
              <input
                id="slug"
                name="slug"
                value={form.slug}
                placeholder="e.g., awesome-product-design (auto-generated from title)"
                onChange={handleSlugChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {form.slug && (
                <p className="text-sm text-gray-500 -mt-2 ml-1">
                  **Full Permalink:** <span className="text-blue-600">{permalink}</span>
                </p>
              )}

              <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                placeholder="Provide a detailed description of your asset"
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />

              <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                id="category"
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

              <label htmlFor="tags" className="block text-sm font-semibold text-gray-700">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                name="tags"
                value={form.tags}
                placeholder="e.g., graphic design, vector, template"
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <label htmlFor="type" className="block text-sm font-semibold text-gray-700">
                Asset Type
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isTrending"
                  name="isTrending"
                  checked={form.isTrending}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isTrending: e.target.checked }))
                  }
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isTrending" className="text-gray-700 text-base cursor-pointer">
                  Mark as **Trending**
                </label>
              </div>
            </div>
          )}

          {/* Tab Content: SEO */}
          {activeTab === "seo" && (
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center justify-between">
                Search Engine Optimization (SEO)
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getSeoScoreColor(seoScore)}`}>
                  {seoScore}
                </div>
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="metaTitle" className="block text-sm font-semibold text-gray-700">
                    Meta Title
                  </label>
                  <input
                    id="metaTitle"
                    name="metaTitle"
                    value={seo.metaTitle}
                    placeholder="SEO Title (e.g., Awesome Product Name - Category)"
                    onChange={handleSeoChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Appears in search engine results. Aim for 50-60 characters.
                  </p>
                </div>

                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-semibold text-gray-700">
                    Meta Description
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={seo.metaDescription}
                    placeholder="SEO Description (e.g., Download this amazing product template for free...)"
                    onChange={handleSeoChange}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Brief summary for search engines. Aim for 150-160 characters.
                  </p>
                </div>

                <div>
                  <label htmlFor="focusKeywords" className="block text-sm font-semibold text-gray-700">
                    Focus Keywords
                  </label>
                  <input
                    id="focusKeywords"
                    name="focusKeywords"
                    value={seo.focusKeywords}
                    placeholder="Comma-separated main keywords (e.g., logo design, branding, vector)"
                    onChange={handleSeoChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Keywords you want your asset to rank for.
                  </p>
                </div>

                {/* SEO Preview */}
                <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <h3 className="text-md font-semibold mb-2 text-blue-800">SEO Preview</h3>
                  <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                    <p className="text-blue-700 text-lg font-medium truncate" dangerouslySetInnerHTML={highlightKeywords(seo.metaTitle, seo.focusKeywords)}>
                    </p>
                    <p className="text-green-700 text-sm mt-1 truncate">
                      {permalink}
                    </p>
                    <p className="text-gray-700 text-sm mt-1 line-clamp-2" dangerouslySetInnerHTML={highlightKeywords(seo.metaDescription, seo.focusKeywords)}>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Advanced */}
          {activeTab === "advanced" && (
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Advanced Options</h2>
              <div className="space-y-4">
                {/* File Type Selection (Multiple Checkboxes) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    File Types (Select multiple)
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {availableFileTypes.map((fileTypeOption) => (
                      <div key={fileTypeOption} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`fileType-${fileTypeOption}`}
                          name="fileTypes"
                          value={fileTypeOption}
                          checked={form.fileTypes.includes(fileTypeOption)}
                          onChange={handleChange}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`fileType-${fileTypeOption}`}
                          className="ml-2 text-gray-700 text-base cursor-pointer"
                        >
                          {fileTypeOption}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orientation Selection (Multiple Checkboxes) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Orientation (Select multiple)
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {["Portrait", "Landscape", "Square"].map((orientationOption) => (
                      <div key={orientationOption} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`orientation-${orientationOption}`}
                          name="orientation"
                          value={orientationOption}
                          checked={form.orientation.includes(orientationOption)}
                          onChange={handleChange}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`orientation-${orientationOption}`}
                          className="ml-2 text-gray-700 text-base cursor-pointer"
                        >
                          {orientationOption}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: File Uploads */}
        <div className="flex-1 space-y-6 border border-gray-200 rounded-2xl p-6 shadow-md bg-white">
          <div>
            <label htmlFor="thumbnail" className="block text-sm font-semibold mb-2 text-gray-700">
              Thumbnail Image
            </label>
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {thumbnailPreview && (
              <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="w-full h-auto max-h-60 object-contain"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-semibold mb-2 text-gray-700">
              Downloadable File (Image/Zip)
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*,application/zip"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Image Preview"
                  className="w-full h-auto max-h-60 object-contain"
                />
              </div>
            )}
          </div>

          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Upload Asset
          </button>
        </div>
      </form>
    </div>
  );
}
