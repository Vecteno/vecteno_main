"use client";

import Link from "next/link";
import { FaCrown, FaGift, FaDownload } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function CategoryPage({ params }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const { category } = await params;
        const categoryNameFormatted = category.replace(/-/g, " ");
        setCategoryName(categoryNameFormatted);
        
        // Fetch images for this category
        const response = await fetch(`/api/images?category=${encodeURIComponent(categoryNameFormatted)}&limit=24`);
        if (response.ok) {
          const data = await response.json();
          setImages(data.images || []);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8fc]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm mb-4">
              <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
              <span>/</span>
              <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-300 rounded w-48 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-96 animate-pulse"></div>
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border rounded-lg shadow-md overflow-hidden">
                <div className="w-full h-40 md:h-60 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
                <div className="p-2 md:p-3 space-y-2">
                  <div className="h-3 md:h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 md:h-4 bg-gray-300 rounded animate-pulse w-1/2"></div>
                  <div className="h-6 md:h-8 bg-gray-300 rounded-md animate-pulse mt-2 md:mt-3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="px-6 py-10 bg-[#f4f8fc] min-h-screen">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No {categoryName} Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find any {categoryName.toLowerCase()} at the moment.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium capitalize">{categoryName}</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 capitalize">
            {categoryName}
          </h1>
          <p className="text-gray-600 mt-2">
            Discover our collection of {categoryName.toLowerCase()} designs and templates
          </p>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {images.map((img) => (
            <div
              key={img._id}
              className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <Link href={`/${img.category.replace(/\s+/g, "-")}/${img.slug}`}>
                <img
                  src={`${img.thumbnailUrl || img.imageUrl || "/img111.jpg"}?v=${Date.now()}`}
                  alt={img.title}
                  className="w-full h-40 md:h-60 object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.log('Image failed to load:', e.target.src);
                    // Try fallback to main image if thumbnail fails
                    if (e.target.src.includes(img.thumbnailUrl) && img.imageUrl) {
                      e.target.src = `${img.imageUrl}?v=${Date.now()}`;
                    } else {
                      e.target.src = '/img111.jpg';
                    }
                  }}
                />
              </Link>
              <div className="p-2 md:p-3 flex flex-col justify-between">
                <h2 className="font-semibold text-xs md:text-sm text-gray-800 line-clamp-2 mb-2 md:mb-3">
                  {img.title}
                </h2>
                <Link
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
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {images.length === 24 && (
          <div className="text-center mt-12">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Load More {categoryName}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
