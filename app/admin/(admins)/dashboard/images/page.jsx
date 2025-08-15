"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EditModal from "../../../components/EditModal";
import UploadModal from "../../../components/UploadModal";
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiTrash2, 
  FiEdit, 
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiPlus,
  FiSmartphone,
  FiMonitor,
  FiSquare
} from "react-icons/fi";

export default function AdminImagesPage() {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("table"); // table or grid
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // <-- Changed default from 10 to 20 so first page shows more items (you can adjust)
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      console.log('Fetching images from /api/admin/images');
      const adminToken = localStorage.getItem('adminToken');
      console.log('Admin token from localStorage:', adminToken ? 'Token exists' : 'No token found');
      
      if (!adminToken) {
        setError('No admin token found. Please login again.');
        setLoading(false);
        return;
      }
      
      const res = await fetch("/api/admin/images", {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      console.log('API Response:', { status: res.status, data });
      
      if (res.ok) {
        console.log('Images loaded successfully:', data.images?.length || 0, 'images');
        // store raw images
        setImages(data.images || []);
        // initialize filtered images
        setFilteredImages(data.images || []);
        const uniqueCategories = [...new Set((data.images || []).map((img) => img.category))];
        setCategories(uniqueCategories);
      } else {
        console.error('API Error:', data.error);
        setError(data.error || "Error loading images");
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  // Ensure when itemsPerPage changes we reset to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    let filtered = images.filter((img) => {
      const typeMatch = filterType === "all" || img.type === filterType;
      const categoryMatch = filterCategory === "all" || img.category === filterCategory;
      const searchMatch = (img.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (img.category || "").toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && categoryMatch && searchMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredImages(filtered);
    setCurrentPage(1);
  }, [filterType, filterCategory, searchTerm, sortBy, sortOrder, images]);

  const handleDelete = async (id, public_id) => {
    if (!confirm("Are you sure you want to delete this image? This action cannot be undone.")) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch("/api/admin/images/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ id, public_id }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = images.filter((img) => img._id !== id);
        setImages(updated);
      } else {
        alert(data.error || "Failed to delete image");
      }
    } catch (err) {
      alert("Error deleting image");
    }
  };

  // totalPages should be at least 1 when filteredImages exists
  const totalPages = Math.max(1, Math.ceil((filteredImages.length || 0) / itemsPerPage));

  // safe slice bounds for pagination
  const startIdx = Math.max(0, (currentPage - 1) * itemsPerPage);
  const endIdx = Math.min(filteredImages.length, currentPage * itemsPerPage);
  const paginatedImages = filteredImages.slice(startIdx, endIdx);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleEditClick = (imageId) => {
    setEditingImageId(imageId);
    setEditModalOpen(true);
  };

  const handleEditSave = (updatedImage) => {
    // Update the images state with the updated image
    setImages(prevImages => 
      prevImages.map(img => 
        img._id === updatedImage._id ? updatedImage : img
      )
    );
    // Also update filtered images
    setFilteredImages(prevImages => 
      prevImages.map(img => 
        img._id === updatedImage._id ? updatedImage : img
      )
    );
  };

  const clearFilters = () => {
    setFilterType("all");
    setFilterCategory("all");
    setSearchTerm("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  // Calculate SEO Score
  const calculateSEOScore = (img) => {
    let score = 0;
    const { title, description, metaTitle, metaDescription, focusKeywords } = img;
    
    // Basic presence checks (20 points each)
    if (title && title.length > 0) score += 20;
    if (description && description.length > 0) score += 20;
    if (metaTitle && metaTitle.length > 0) score += 15;
    if (metaDescription && metaDescription.length > 0) score += 15;
    if (focusKeywords && focusKeywords.length > 0) score += 10;
    
    // Title length optimization (10 points)
    if (title && title.length >= 30 && title.length <= 60) score += 10;
    else if (title && title.length > 0) score += 5;
    
    // Description length optimization (10 points)
    if (description && description.length >= 120 && description.length <= 160) score += 10;
    else if (description && description.length > 0) score += 5;
    
    return Math.min(score, 100);
  };

  // Get SEO score color
  const getSEOScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Get file types array
  const getFileTypes = (img) => {
    if (img.fileTypes && Array.isArray(img.fileTypes)) {
      return img.fileTypes.join(', ');
    } else if (img.fileTypes && typeof img.fileTypes === 'string') {
      try {
        return JSON.parse(img.fileTypes).join(', ');
      } catch {
        return img.fileTypes;
      }
    }
    return 'N/A';
  };

  // Get orientation array
  const getOrientation = (img) => {
    if (img.orientation && Array.isArray(img.orientation)) {
      return img.orientation.join(', ');
    } else if (img.orientation && typeof img.orientation === 'string') {
      try {
        return JSON.parse(img.orientation).join(', ');
      } catch {
        return img.orientation;
      }
    }
    return 'N/A';
  };

  // Check if a file is an image based on extension
  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Get proper image URL with fallback
  const getImageUrl = (img) => {
    // If the imageUrl is already a full URL, use it
    if (img.imageUrl && img.imageUrl.startsWith('http')) {
      return img.imageUrl;
    }
    
    // If it starts with /uploads/, convert to /api/uploads/
    if (img.imageUrl && img.imageUrl.startsWith('/uploads/')) {
      return `/api${img.imageUrl}`;
    }
    
    // If it's already an API path, use it
    if (img.imageUrl && img.imageUrl.startsWith('/api/uploads/')) {
      return img.imageUrl;
    }
    
    // If it's just a filename, try images directory first
    if (img.imageUrl && !img.imageUrl.includes('/')) {
      return `/api/uploads/images/${img.imageUrl}`;
    }
    
    // Use thumbnail as fallback
    if (img.thumbnailUrl) {
      if (img.thumbnailUrl.startsWith('http')) {
        return img.thumbnailUrl;
      }
      if (img.thumbnailUrl.startsWith('/uploads/')) {
        return `/api${img.thumbnailUrl}`;
      }
      if (img.thumbnailUrl.startsWith('/api/uploads/')) {
        return img.thumbnailUrl;
      }
      if (!img.thumbnailUrl.includes('/')) {
        return `/api/uploads/images/${img.thumbnailUrl}`;
      }
    }
    
    // Generate a placeholder URL
    return `data:image/svg+xml;base64,${btoa(`<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#9ca3af">No Image</text></svg>`)}`;
  };

  // Handle image load errors with multiple fallback strategies
  const handleImageError = (e, img) => {
    const currentSrc = e.target.src;
    console.warn(`Image not found: ${img.title} - ${currentSrc}`);
    
    // Try different fallback strategies
    const fallbackStrategies = [
      // Strategy 1: Try thumbnail URL
      img.thumbnailUrl ? getImageUrl({...img, imageUrl: img.thumbnailUrl}) : null,
      // Strategy 2: Try images directory with filename only
      img.imageUrl && !img.imageUrl.includes('/') ? `/api/uploads/images/${img.imageUrl}` : null,
      // Strategy 3: Try categories directory as fallback
      img.imageUrl && !img.imageUrl.includes('/') ? `/api/uploads/categories/${img.imageUrl}` : null,
      // Strategy 4: Try different path construction
      img.imageUrl && img.imageUrl.includes('uploads/images/') ? `/api/uploads/categories/${img.imageUrl.split('/').pop()}` : null,
    ].filter(Boolean);
    
    // Try next fallback strategy
    for (const fallbackUrl of fallbackStrategies) {
      if (fallbackUrl && fallbackUrl !== currentSrc) {
        e.target.src = fallbackUrl;
        return;
      }
    }
    
    // All fallbacks failed, show placeholder
    e.target.style.display = 'none';
    if (e.target.parentElement) {
      e.target.parentElement.innerHTML = `
        <div class="flex items-center justify-center bg-gray-100 rounded-lg h-12 w-16 border">
          <span class="text-xs text-gray-500">Missing</span>
        </div>
      `;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Image Management</h1>
            <p className="text-gray-600 mt-1">Manage and organize your uploaded images</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchImages}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw className="text-sm" />
              Refresh
            </button>
            <button 
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="text-sm" />
              Upload New
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Images</p>
                <p className="text-2xl font-bold text-gray-800">{images.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiGrid className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {images.filter(img => img.type === "premium").length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiEye className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Free</p>
                <p className="text-2xl font-bold text-green-600">
                  {images.filter(img => img.type === "free").length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <FiDownload className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiFilter className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search images by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
              <option value="type">Sort by Type</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>

            <button
              onClick={clearFilters}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View Mode:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-colors ${viewMode === "table" ? "bg-white shadow-sm" : "text-gray-600"}`}
              >
                <FiList />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"}`}
              >
                <FiGrid />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          Showing {filteredImages.length === 0 ? 0 : startIdx + 1} to {endIdx} of {filteredImages.length} images
        </p>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SEO Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orientation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedImages.map((img) => (
                  <tr key={img._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {isImageFile(getImageUrl(img)) ? (
                          <img
                            src={getImageUrl(img)}
                            alt={img.title}
                            onError={(e) => handleImageError(e, img)}
                            className={`object-cover rounded-lg shadow-sm ${getOrientation(img).toLowerCase().includes('portrait') ? 'h-16 w-12' : getOrientation(img).toLowerCase().includes('square') ? 'h-12 w-12' : 'h-12 w-16'}`}
                          />
                        ) : (
                          <div className="flex items-center justify-center bg-gray-100 rounded-lg h-12 w-16 border">
                            <span className="text-xs text-gray-500 font-medium">
                              {getFileTypes(img).split(',')[0] || 'FILE'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{img.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {img.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${img.type === "premium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                        {img.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {img.createdAt ? new Date(img.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const score = calculateSEOScore(img);
                        return (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSEOScoreColor(score)}`}>
                            {score}/100
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="truncate max-w-24" title={getFileTypes(img)}>
                        {getFileTypes(img)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2" title={getOrientation(img)}>
                        {(getOrientation(img).toLowerCase().includes('portrait')) && (
                          <div className="flex items-center gap-1">
                            <FiSmartphone className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">Portrait</span>
                          </div>
                        )}
                        {(getOrientation(img).toLowerCase().includes('landscape')) && (
                          <div className="flex items-center gap-1">
                            <FiMonitor className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-600">Landscape</span>
                          </div>
                        )}
                        {(getOrientation(img).toLowerCase().includes('square')) && (
                          <div className="flex items-center gap-1">
                            <FiSquare className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600">Square</span>
                          </div>
                        )}
                        {!getOrientation(img) || getOrientation(img) === 'N/A' ? (
                          <span className="text-xs text-gray-400">N/A</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors" title="View">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 transition-colors"
                          onClick={() => handleEditClick(img._id)}
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(img._id, img.public_id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedImages.map((img) => (
            <div key={img._id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                {isImageFile(getImageUrl(img)) ? (
                  <img
                    src={getImageUrl(img)}
                    alt={img.title}
                    onError={(e) => handleImageError(e, img)}
                    className={`w-full object-cover ${getOrientation(img).toLowerCase().includes('portrait') ? 'h-64' : getOrientation(img).toLowerCase().includes('square') ? 'h-48' : 'h-40'}`}
                  />
                ) : (
                  <div className="w-full bg-gray-100 border flex items-center justify-center h-40">
                    <div className="text-center p-4">
                      <span className="text-2xl text-gray-400 font-bold block mb-2">
                        {getFileTypes(img).split(',')[0]?.toUpperCase() || 'FILE'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Non-image file
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${img.type === "premium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                    {img.type}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 truncate">{img.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="capitalize">{img.category}</span>
                  <span>{img.createdAt ? new Date(img.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                    <FiEye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 hover:text-green-800 transition-colors"
                    onClick={() => handleEditClick(img._id)}
                  >
                    <FiEdit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(img._id, img.public_id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"}`}
            >
              <FiChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"}`}
            >
              Next
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingImageId(null);
        }}
        imageId={editingImageId}
        onSave={handleEditSave}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSave={(newImage) => {
          // Add the new image to the beginning of the list
          setImages([newImage, ...images]);
          setFilteredImages([newImage, ...filteredImages]);
        }}
      />
    </div>
  );
}
