"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FaCrown } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { FiSmartphone, FiMonitor, FiSquare } from "react-icons/fi";

export default function ImageGallery() {
  const [images, setImages] = useState([]);
  const [allImages, setAllImages] = useState([]); // Store all images for filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [license, setLicense] = useState("all");
  const [orientation, setOrientation] = useState([]);
  const [fileType, setFileType] = useState([]);
  
  // Dropdown states
  const [showLicenseDropdown, setShowLicenseDropdown] = useState(false);
  const [showOrientationDropdown, setShowOrientationDropdown] = useState(false);
  const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Creatives");

  // Refs for click outside detection
  const licenseDropdownRef = useRef(null);
  const orientationDropdownRef = useRef(null);
  const fileTypeDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  const limit = 9;
  const router = useRouter();

  // Filter options
  const orientationOptions = [
    { value: "Portrait", label: "Portrait", icon: FiSmartphone },
    { value: "Landscape", label: "Landscape", icon: FiMonitor },
    { value: "Square", label: "Square", icon: FiSquare }
  ];
  const fileTypeOptions = ["PSD", "CDR", "AE", "AI", "JPG", "PNG"];
  const [categories, setCategories] = useState(["All Creatives"]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success && data.categories) {
          const categoryNames = data.categories.map(cat => cat.label);
          setCategories(['All Creatives', ...categoryNames]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep default categories as fallback
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        // Add filters
        if (license !== 'all') {
          params.append('type', license);
        }
        
        if (selectedCategory !== 'All Creatives') {
          params.append('category', selectedCategory);
        }
        
        if (orientation.length > 0) {
          params.append('orientation', orientation.join(','));
        }
        
        if (fileType.length > 0) {
          params.append('fileType', fileType.join(','));
        }
        
        const res = await fetch(`/api/images?${params.toString()}`);
        const data = await res.json();
        
        // Ensure images is always an array
        let imagesArray = data.images || [];
        const totalCount = data.total || 0;
        
        // Apply search filter on frontend if needed
        if (searchQuery.trim()) {
          imagesArray = imagesArray.filter(img => 
            img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            img.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            img.category?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setImages(imagesArray);
        setAllImages(imagesArray);
        setTotalPages(Math.ceil(totalCount / limit));
      } catch (error) {
        console.error('Error fetching images:', error);
        setImages([]);
        setAllImages([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [page, license, selectedCategory, orientation, fileType]);

  // Search filter - only apply client-side for search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allImages.filter(img => 
        img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setImages(filtered);
    } else {
      setImages(allImages);
    }
  }, [searchQuery, allImages]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (licenseDropdownRef.current && !licenseDropdownRef.current.contains(event.target)) {
        setShowLicenseDropdown(false);
      }
      if (orientationDropdownRef.current && !orientationDropdownRef.current.contains(event.target)) {
        setShowOrientationDropdown(false);
      }
      if (fileTypeDropdownRef.current && !fileTypeDropdownRef.current.contains(event.target)) {
        setShowFileTypeDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // AJAX search is already working with the useEffect above
    // This prevents form submission and page reload
  };

  const handleOrientationChange = (value) => {
    setOrientation(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const handleFileTypeChange = (value) => {
    setFileType(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  // Close other dropdowns when one opens
  const openDropdown = (dropdownType) => {
    setShowLicenseDropdown(dropdownType === 'license');
    setShowOrientationDropdown(dropdownType === 'orientation');
    setShowFileTypeDropdown(dropdownType === 'fileType');
    setShowCategoryDropdown(dropdownType === 'category');
  };

  return (
    <div className="py-6 h-full">
      {/* Enhanced Search Bar - Matching the image design */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="bg-white border border-gray-200 shadow-lg rounded-full p-2">
          <form onSubmit={handleSearch} className="flex items-center">
            {/* Left Section - Category Dropdown (Hidden on Mobile) */}
            <div className="relative flex items-center hidden md:flex" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => openDropdown('category')}
                className="flex items-center gap-2 px-4 py-3 text-blue-600 font-medium hover:bg-gray-50 rounded-l-full transition-colors"
              >
                {selectedCategory}
                <IoIosArrowDown className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[200px]">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Vertical separator line */}
              <div className="w-px h-8 bg-gray-300 mx-2"></div>
            </div>

            {/* Middle Section - Search Input */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search best 15k+ design resources........"
                className="w-full outline-none text-sm px-4 py-3 text-gray-700 placeholder-gray-400 md:pl-0 pl-4"
              />
            </div>

            {/* Right Section - Search Button */}
            <button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <FaSearch className="text-white text-xs md:text-sm" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Category Navigation Section */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
          <div className="flex flex-nowrap overflow-x-auto gap-3 justify-between pb-1 hide-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {category === "All Creatives" ? (
                  <>
                    <span className="hidden md:inline">All Creatives</span>
                    <span className="md:hidden">All</span>
                  </>
                ) : (
                  category
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h1 className="text-5xl font-semibold mb-6 bg-blue-100 w-full p-8 pl-5 md:pl-20 capitalize">
        {selectedCategory === "All Creatives" ? (
          <>
            <span className="hidden md:inline">All Creatives</span>
            <span className="md:hidden">All</span>
          </>
        ) : (
          selectedCategory
        )}
      </h1>

      {/* Filter Dropdowns - Above Images */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4 px-4 md:px-20 mb-6">
        {/* License Dropdown */}
        <div className="relative" ref={licenseDropdownRef}>
          <button
            onClick={() => openDropdown('license')}
            className="flex items-center gap-1 md:gap-2 bg-white border border-gray-300 rounded-lg px-2 md:px-4 py-1 md:py-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs md:text-sm font-medium">License</span>
            <IoIosArrowDown className={`transition-transform text-xs md:text-sm ${showLicenseDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showLicenseDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[120px] md:min-w-[150px]">
              {["all", "free", "premium"].map((option) => (
                <label key={option} className="flex items-center gap-2 px-3 md:px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="radio"
                    name="license"
                    value={option}
                    checked={license === option}
                    onChange={(e) => setLicense(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-xs md:text-sm capitalize flex items-center gap-1">
                    {option === "premium" && <FaCrown className="text-yellow-500 text-xs" />}
                    {option}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Orientation Dropdown */}
        <div className="relative" ref={orientationDropdownRef}>
          <button
            onClick={() => openDropdown('orientation')}
            className="flex items-center gap-1 md:gap-2 bg-white border border-gray-300 rounded-lg px-2 md:px-4 py-1 md:py-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs md:text-sm font-medium">Orientation</span>
            <IoIosArrowDown className={`transition-transform text-xs md:text-sm ${showOrientationDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showOrientationDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[140px] md:min-w-[180px]">
              {orientationOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <label key={option.value} className="flex items-center gap-2 px-3 md:px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={orientation.includes(option.value)}
                      onChange={() => handleOrientationChange(option.value)}
                      className="text-blue-600 rounded"
                    />
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <span className="text-xs md:text-sm">{option.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* File Type Dropdown */}
        <div className="relative" ref={fileTypeDropdownRef}>
          <button
            onClick={() => openDropdown('fileType')}
            className="flex items-center gap-1 md:gap-2 bg-white border border-gray-300 rounded-lg px-2 md:px-4 py-1 md:py-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs md:text-sm font-medium">File Type</span>
            <IoIosArrowDown className={`transition-transform text-xs md:text-sm ${showFileTypeDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showFileTypeDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[120px] md:min-w-[150px]">
              {fileTypeOptions.map((option) => (
                <label key={option} className="flex items-center gap-2 px-3 md:px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fileType.includes(option)}
                    onChange={() => handleFileTypeChange(option)}
                    className="text-blue-600 rounded"
                  />
                  <span className="text-xs md:text-sm">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={() => {
            setLicense("all");
            setOrientation([]);
            setFileType([]);
            setSearchQuery("");
            setSelectedCategory("All Creatives");
          }}
          className="text-gray-600 hover:text-gray-800 text-xs md:text-sm underline"
        >
          Clear All
        </button>
      </div>

      {loading ? (
        // YouTube-style masonry skeleton loading
        <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4 px-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="relative w-full break-inside-avoid overflow-hidden rounded-lg shadow mb-4"
              style={{
                // Random heights for masonry effect
                height: `${200 + (i % 4) * 50}px`
              }}
            >
              {/* Image skeleton */}
              <div className="w-full h-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded-lg"></div>
              
              {/* Premium badge skeleton */}
              {i % 3 === 0 && (
                <div className="absolute top-2 right-2 bg-gray-300 animate-pulse px-3 py-1 rounded-full shadow">
                  <div className="bg-gray-400 h-4 w-16 rounded"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4 px-2">
            {(images || []).map((img) => (
              <div
                key={img._id}
                className="relative w-full h-[50%] break-inside-avoid overflow-hidden rounded-lg shadow hover:shadow-xl transition"
              >
                <Link href={`/${img.category?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}/${img.slug}`}>
                  <img
                    src={`${img.thumbnailUrl || img.imageUrl || "/img111.jpg"}?v=${Date.now()}`}
                    alt={img.title}
                    className="w-full rounded-lg hover:opacity-90 transition-all duration-300"
                    onError={(e) => {
                      console.log('Products page image failed to load:', e.target.src);
                      // Try fallback to main image if thumbnail fails
                      if (e.target.src.includes(img.thumbnailUrl) && img.imageUrl) {
                        e.target.src = `${img.imageUrl}?v=${Date.now()}`;
                      } else {
                        e.target.src = '/img111.jpg';
                      }
                    }}
                  />
                  {img.type === "premium" && (
                    <div className="absolute top-2 right-2 bg-yellow-400 px-2 py-1 rounded-full shadow flex items-center justify-center gap-1 text-sm font-medium">
                      <FaCrown className="text-white" /> Premium
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>

          {/* Show message when no results */}
          {images.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No images found matching your criteria.</p>
            </div>
          )}

          {/* Pagination Controls - Only show if not filtering */}
          {searchQuery === "" && orientation.length === 0 && fileType.length === 0 && license === "all" && selectedCategory === "All Creatives" && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className={`px-4 py-2 rounded ${
                  page <= 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              <span className="px-4 py-2">{`Page ${page} of ${totalPages}`}</span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className={`px-4 py-2 rounded ${
                  page >= totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
