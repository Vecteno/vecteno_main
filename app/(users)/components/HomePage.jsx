"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaImage,
  FaVectorSquare,
  FaPuzzlePiece,
  FaShapes,
  FaEllipsisH,
  FaSearch,
  FaCrown,
  FaGift,
  FaSpinner,
  FaEdit,
} from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import CategoriesSection from "./CategorySectionHome";
import Popup from "./Popup";
import { useRouter } from "next/navigation";
import ClientReviews from "./ClientReviews";
import Link from "next/link";
import TrendingSection from "./TrendingSection";

const HomePage = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Creatives");
  const [bannerUrl, setBannerUrl] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [filteredImages, setFilteredImages] = useState([]);
  const [dropdownCategories, setDropdownCategories] = useState([]);
  const [mainHeading, setMainHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");

  const router = useRouter();
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchBanner = async () => {
      const res = await fetch("/api/admin/homepage");
      const data = await res.json();
      if (res.ok && data?.data?.heroImageUrl) {
        setBannerUrl(data.data.heroImageUrl);
        setMainHeading(data.data.mainHeading || "");
        setSubHeading(data.data.subHeading || "");
      }
    };
    fetchBanner();
  }, []);

  const [topImages, setTopImages] = useState([]);
  const [topImagesLoading, setTopImagesLoading] = useState(true);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        setTopImagesLoading(true);
        const res = await fetch("/api/images/top-liked");
        const data = await res.json();
        console.log("Top rated data:", data); // Debug log
        if (data.success) {
          setTopImages(data.images);
          setFilteredImages(data.images);
        }
      } catch (err) {
        console.error("Failed to load top rated images", err);
      } finally {
        setTopImagesLoading(false);
      }
    };

    fetchTopRated();
  }, []);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchDropdownCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success && data.categories) {
          const categoryNames = data.categories.map((cat) => cat.label);
          setDropdownCategories(["All Creatives", ...categoryNames]);
        }
      } catch (error) {
        console.error("Error fetching dropdown categories:", error);
        // Fallback to default categories
        setDropdownCategories([
          "All Categories",
          "Templates",
          "CDR Files",
          "PSD Files",
          "Invitations",
          "Banners",
          "Social Media",
          "Thumbnails",
        ]);
      }
    };
    fetchDropdownCategories();
  }, []);

  // Filter images based on active filter
  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredImages(topImages);
    } else if (activeFilter === "Free") {
      setFilteredImages(topImages.filter((img) => img.type !== "premium"));
    } else if (activeFilter === "Premium") {
      setFilteredImages(topImages.filter((img) => img.type === "premium"));
    }
  }, [activeFilter, topImages]);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowSearchDropdown(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.images || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      // Include category only if selectedCategory is not "All" or empty
      const categoryParam =
        selectedCategory && selectedCategory !== "All"
          ? `&category=${encodeURIComponent(selectedCategory)}`
          : "";

      router.push(`/search?q=${encodeURIComponent(query)}${categoryParam}`);

      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const handleSearchResultClick = (result) => {
    router.push(`/${result.category.replace(/\s+/g, "-")}/${result.slug}`);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabClick = (label) => {
    if (label.toLowerCase() === "all designs") {
      router.push(`/products`);
    } else {
      router.push(`/search?category=${encodeURIComponent(label)}`);
    }
  };

  const tabOptions = [
    { label: "Images", icon: <FaImage /> },
    { label: "Vector", icon: <FaVectorSquare /> },
    { label: "Plugins", icon: <FaPuzzlePiece /> },
    { label: "PSD", icon: <FaEdit /> },
    { label: "Wallpapers", icon: <FaImage /> },
    { label: "All Designs", icon: <FaShapes /> },
  ];

  const [activeTab, setActiveTab] = useState("Vector");

  return (
    <div>
      <Popup />

      {/* ✅ Hero Section with dynamic background */}
      <section
        className="relative text-white py-20 px-4 bg-cover bg-center h-[95vh] flex flex-col items-center justify-center before:absolute before:inset-0 before:bg-black/50 before:z-0"
        style={{
          backgroundImage: `url(${bannerUrl || "/img117.jpg"})`,
        }}
      >
        {/* Headline */}
        <div className="relative text-center mb-10 z-10">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {mainHeading}
          </h1>
          <p className="mt-4 text-lg text-gray-200">{subHeading}</p>
        </div>

        {/* Search bar */}
        <div
          className="flex flex-col md:flex-row justify-center items-center max-w-5xl mx-auto w-full bg-white rounded-2xl md:rounded-full p-2 z-10"
          ref={searchRef}
        >
          {/* Dropdown - Hidden on Mobile */}
          <div
            className="relative w-full md:w-auto hidden md:block mr-3"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            {/* Dropdown Button */}
            <button
              className="flex items-center justify-between w-full md:w-52 px-4 py-2.5 
      bg-gradient-to-r from-blue-500 to-blue-600 text-white 
      font-medium rounded-3xl shadow-md hover:shadow-lg 
      hover:from-blue-600 hover:to-blue-700 
      transition-all duration-200"
            >
              {selectedCategory}
              <IoIosArrowDown
                className={`ml-2 transform transition-transform duration-200 ${
                  showDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="absolute top-full left-0 mt-0 bg-white border border-gray-200 
        rounded-xl shadow-xl z-50  backdrop-blur-sm p-2 flex gap-4"
              >
                {Array.from(
                  { length: Math.ceil(dropdownCategories.length / 6) },
                  (_, colIndex) => (
                    <ul key={colIndex} className="w-35">
                      {dropdownCategories
                        .slice(colIndex * 6, colIndex * 6 + 6)
                        .map((cat, idx) => (
                          <li
                            key={idx}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setShowDropdown(false); // 🔥 close on click
                            }}
                            className="px-4 py-2.5 text-sm text-gray-700 
                    hover:bg-blue-50 hover:text-blue-600 
                    cursor-pointer transition-colors duration-150"
                          >
                            {cat}
                          </li>
                        ))}
                    </ul>
                  )
                )}
              </div>
            )}
          </div>

          {/* Search input with AJAX */}
          <div className="relative flex items-center w-full">
            <form onSubmit={handleSearch} className="flex items-center w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for graphics..."
                className="flex-1 outline-none text-sm border border-gray-300 rounded-full px-4 py-2 shadow-sm text-black"
              />
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-2 rounded-full w-12 h-12 flex justify-center items-center m-1">
                <button type="submit" className="cursor-pointer">
                  {isSearching ? (
                    <FaSpinner className="animate-spin text-white" />
                  ) : (
                    <FaSearch className="text-white" />
                  )}
                </button>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <FaSpinner className="animate-spin mx-auto mb-2" />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    {searchResults.slice(0, 6).map((result) => (
                      <div
                        key={result._id}
                        onClick={() => handleSearchResultClick(result)}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                          {result.imageUrl && (
                            <img
                              src={result.imageUrl}
                              alt={result.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {result.category}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    ))}
                    {searchResults.length > 6 && (
                      <div className="p-3 text-center border-t border-gray-100">
                        <button
                          onClick={handleSearch}
                          className="text-blue-600 text-sm hover:text-blue-800"
                        >
                          View all {searchResults.length} results
                        </button>
                      </div>
                    )}
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center flex-wrap gap-4 mt-12 z-0 md:bg-gradient-to-r from-blue-500 to-blue-700 p-3 rounded-xl">
          {tabOptions.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => handleTabClick(tab.label)}
              className={`flex items-center space-x-2 px-6 py-3 rounded bg-blue-400 hover:bg-blue-700 transition h-20 cursor-pointer
            ${idx >= 3 ? "hidden md:flex" : ""}`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      <CategoriesSection />

      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Top Rated
          </h1>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterClick("All")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 shadow-md ${
                activeFilter === "All"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterClick("Free")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                activeFilter === "Free"
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => handleFilterClick("Premium")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                activeFilter === "Premium"
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Premium
            </button>
          </div>
        </div>

        {topImagesLoading ? (
          // YouTube-style skeleton loading
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white border rounded-lg shadow-md overflow-hidden"
              >
                {/* Image skeleton */}
                <div className="relative">
                  <div className="w-full h-40 md:h-60 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
                </div>
                {/* Content skeleton */}
                <div className="p-2 md:p-3 space-y-2">
                  {/* Title skeleton */}
                  <div className="space-y-1">
                    <div className="h-3 md:h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 md:h-4 bg-gray-300 rounded animate-pulse w-1/2"></div>
                  </div>
                  {/* Button skeleton */}
                  <div className="h-6 md:h-8 bg-gray-300 rounded-md animate-pulse mt-2 md:mt-3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {filteredImages.map((img) => (
              <div
                key={img._id}
                className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <a href={`/${img.category.replace(/\s+/g, "-")}/${img.slug}`}>
                  <img
                    src={`${
                      img.thumbnailUrl || img.imageUrl || "/img111.jpg"
                    }?v=${Date.now()}`}
                    alt={img.title}
                    className="w-full h-40 md:h-60 object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.log("Image failed to load:", e.target.src);
                      // Try fallback to main image if thumbnail fails
                      if (
                        e.target.src.includes(img.thumbnailUrl) &&
                        img.imageUrl
                      ) {
                        e.target.src = `${img.imageUrl}?v=${Date.now()}`;
                      } else {
                        e.target.src = "/img111.jpg";
                      }
                    }}
                  />
                </a>
                <div className="p-2 md:p-3 flex flex-col justify-between">
                  <h2 className="font-semibold text-xs md:text-sm text-gray-800 line-clamp-2 mb-2 md:mb-3">
                    {img.title}
                  </h2>
                  <a
                    href={`/${img.category.replace(/\s+/g, "-")}/${img.slug}`}
                    className={`block text-center text-white font-medium text-xs md:text-sm py-1.5 md:py-2 px-2 md:px-3 rounded-md md:rounded transition-all duration-300 hover:scale-105 ${
                      img.type === "premium"
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 shadow-md"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                    }`}
                  >
                    {img.type === "premium" ? (
                      <span className="flex items-center justify-center gap-1">
                        <FaCrown className="text-xs md:text-sm" />
                        <span className="hidden sm:inline">Premium</span>
                        <span className="sm:hidden">Premium</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <FaGift className="text-xs md:text-sm" />
                        <span className="hidden sm:inline">Free Download</span>
                        <span className="sm:hidden">Free</span>
                      </span>
                    )}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Section */}
      <div className="mt-20 bg-blue-200">
        <TrendingSection />
      </div>

      {/* Join The Creator Community Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content Side */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Join The Creator Community
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Connect, Create, and Grow – Join thousands of designers,
                  artists, and storytellers who come together to share ideas,
                  inspire each other, and build their creative journey.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Unlimited Downloads
                    </h3>
                    <p className="text-sm text-gray-600">
                      Access to 10,000+ premium resources
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Community Support
                    </h3>
                    <p className="text-sm text-gray-600">
                      Connect with fellow creators
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Premium Quality
                    </h3>
                    <p className="text-sm text-gray-600">
                      High-resolution, professional designs
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Regular Updates
                    </h3>
                    <p className="text-sm text-gray-600">
                      New content added weekly
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Join Community
                </button>
                <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105">
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">
                    10K+
                  </div>
                  <div className="text-sm text-gray-600">Resources</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">
                    5K+
                  </div>
                  <div className="text-sm text-gray-600">Creators</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">
                    24/7
                  </div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://vecteno.com/wp-content/uploads/al_opt_content/IMAGE/vecteno.com/wp-content/uploads/2025/07/Get-Unlimited-Downloads-2.png.bv_resized_desktop.png.bv.webp"
                  alt="Join Creator Community"
                  className="w-full h-auto rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
                />
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
              <div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
          </div>
        </div>
      </section>
      <div>
        <ClientReviews />
      </div>
    </div>
  );
};

export default HomePage;
