"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function EditUpload() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    tags: "",
    type: "free",
    thumbnail: null,
    image: null,
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

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [imagePreview, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("general");
  const [currentImageData, setCurrentImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const params = useParams();
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    if (id) {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      const config = adminToken ? {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      } : {};
      
      fetch(`/api/admin/images/${id}`, config)
        .then((res) => {
          if (res.status === 401) {
            // Unauthorized - redirect to login
            window.location.href = '/admin/login';
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            const imageData = data.image;
            setCurrentImageData(imageData);
            setForm({
              title: imageData.title || "",
              slug: imageData.slug || "",
              description: imageData.description || "",
              category: imageData.category || "",
              tags: (imageData.tags || []).join(", "),
              type: imageData.type || "free",
              thumbnail: null,
              image: null,
              isTrending: imageData.isTrending || false,
              fileTypes: imageData.fileTypes || [],
              orientation: imageData.orientation || [],
            });
            
            // Set SEO data if available
            setSeo({
              metaTitle: imageData.metaTitle || "",
              metaDescription: imageData.metaDescription || "",
              focusKeywords: imageData.focusKeywords || "",
            });

            // Instead of hard-coding categories, fetch them from the backend
            const token = localStorage.getItem('adminToken');
            const config = token ? {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            } : {};
            
            fetch('/api/admin/categories', config)
              .then(res => res.json())
              .then(categoryData => {
                // The API returns categories directly, not wrapped in a success object
                if (Array.isArray(categoryData)) {
                  setCategories(categoryData);
                } else {
                  setCategories([]);
                }
                setLoading(false);
              })
              .catch(() => {
                setCategories([]);
                setLoading(false);
              });

          } else {
            setMessage({ text: "Error loading image details", type: "error" });
            setLoading(false);
          }
        })
        .catch(() => {
          setMessage({ text: "Error loading image details", type: "error" });
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files, checked, type } = e.target;

    if (files) {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));

      if (name === "thumbnail") {
        setThumbnailPreview(URL.createObjectURL(file));
      } else if (name === "image") {
        setImage(URL.createObjectURL(file));
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
    const formData = new FormData();

    for (let key in form) {
      if (Array.isArray(form[key])) {
        formData.append(key, JSON.stringify(form[key]));
      } else if (form[key] !== null && form[key] !== undefined) {
        // Only append files if they exist
        if (key === 'image' || key === 'thumbnail' || key === 'downloadFile') {
          if (form[key] instanceof File) {
            formData.append(key, form[key]);
          }
        } else {
          formData.append(key, form[key]);
        }
      }
    }

    for (let key in seo) {
      formData.append(key, seo[key]);
    }

    formData.append("slug", form.slug || customSlugify(form.title));

    const xhr = new XMLHttpRequest();
    const adminToken = localStorage.getItem('adminToken');
    xhr.open("PUT", `/api/admin/images/${id}`, true);
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
          setMessage({ text: "Update successful!", type: "success" });
          setTimeout(() => {
            router.push("/admin/dashboard/images");
          }, 2000);
        } else {
          setMessage({ text: "Update failed.", type: "error" });
        }
      } else {
        setMessage({ text: "Server Error.", type: "error" });
      }
      setUploadProgress(0);
    };

    xhr.onerror = function () {
      setMessage({ text: "Something went wrong.", type: "error" });
      setUploadProgress(0);
    };

    xhr.send(formData);
  };

  const permalink = `https://vecteno.com/products/${form.slug || "your-product-slug"}`;
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
        Edit Asset
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
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

          {activeTab === "seo" && (
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center justify-between">
                Search Engine Optimization (SEO)
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
                  <h3 className="text-md font-semibold mb-2 text-blue-800">
                    SEO Preview
                  </h3>
                  <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                    <p className="text-blue-700 text-lg font-medium truncate">
                      {seo.metaTitle || form.title}
                    </p>
                    <p className="text-green-700 text-sm mt-1 truncate">
                      {permalink}
                    </p>
                    <p className="text-gray-700 text-sm mt-1 line-clamp-2">
                      {seo.metaDescription || form.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
             <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
               <h2 className="text-xl font-bold mb-4 text-gray-800">Advanced Options</h2>
               <div className="space-y-4">
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

        <div className="flex-1 space-y-6 border border-gray-200 rounded-2xl p-6 shadow-md bg-white">
          {/* Current Image Preview */}
          {!loading && currentImageData && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Asset Preview</h3>
              <div className="flex flex-col space-y-4">
                <div className="w-full bg-gray-100 rounded-lg overflow-hidden">
                  {/* Show new image preview if selected, otherwise show current image */}
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="New image preview" 
                      className="w-full h-48 object-contain"
                    />
                  ) : (
                    <img 
                      src={currentImageData.imageUrl} 
                      alt={currentImageData.title} 
                      className="w-full h-48 object-contain"
                    />
                  )}
                  <div className="p-2">
                    <button 
                      type="button"
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      Replace Image
                    </button>
                    <input
                      type="file"
                      hidden
                      id="image-upload"
                      onChange={handleChange}
                      name="image"
                      accept="image/*"
                    />
                  </div>
                </div>
                
                {/* Downloadable File Section */}
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Downloadable File</h4>
                  {currentImageData.downloadUrl && currentImageData.downloadFileName ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded">
                            {currentImageData.downloadFileType === 'zip' ? (
                              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M16 2H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zM4 4h12v12H4V4z"/>
                                <path d="M8 6h4v2H8V6zM6 8h2v2H6V8zM10 8h2v2h-2V8zM8 10h4v2H8v-2zM6 12h2v2H6v-2zM10 12h2v2h-2v-2z"/>
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{currentImageData.downloadFileName || 'Download File'}</p>
                            <p className="text-sm text-gray-500">
                              {currentImageData.downloadFileType?.toUpperCase()} • {Math.round((currentImageData.downloadFileSize || 0) / 1024)} KB
                            </p>
                          </div>
                        </div>
                        <a 
                          href={currentImageData.downloadUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                          View
                        </a>
                      </div>
                      <button 
                        type="button"
                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                        onClick={() => document.getElementById('download-file-upload').click()}
                      >
                        Replace Download File
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-2">
                        {currentImageData.downloadFileName ? 
                          `Current file: ${currentImageData.downloadFileName}` : 
                          'No downloadable file uploaded'
                        }
                      </p>
                      <button 
                        type="button"
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        onClick={() => document.getElementById('download-file-upload').click()}
                      >
                        {currentImageData.downloadFileName ? 'Replace Download File' : 'Add Download File'}
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    hidden
                    id="download-file-upload"
                    onChange={handleChange}
                    name="downloadFile"
                    accept=".zip,.png,.jpg,.jpeg,.svg,.pdf,.eps,.ai,.psd,.cdr"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div><strong>ID:</strong> {currentImageData._id}</div>
                    <div><strong>File:</strong> {currentImageData.fileName || 'N/A'}</div>
                    <div><strong>Type:</strong> {currentImageData.type || 'free'}</div>
                    <div><strong>Category:</strong> {currentImageData.category}</div>
                    <div><strong>File Types:</strong> {(currentImageData.fileTypes || []).join(', ') || 'None'}</div>
                    <div><strong>Orientation:</strong> {(currentImageData.orientation || []).join(', ') || 'None'}</div>
                    <div><strong>Created:</strong> {new Date(currentImageData.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Update Asset
          </button>
        </div>
      </form>
    </div>
  );
}

