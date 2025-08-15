'use client';

import Link from 'next/link';
import { FaCrown, FaGift } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';

export default function RelatedImagesGrid({ relatedImages, categorySlug }) {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const imageRefs = useRef({});
  
  // Initialize all images as loading when relatedImages change
  useEffect(() => {
    if (relatedImages && relatedImages.length > 0) {
      setLoadedImages(new Set());
      imageRefs.current = {};
    }
  }, [relatedImages]);
  
  // Function to handle image load
  const handleImageLoad = (imageId, imgElement) => {
    // Check if image is actually complete and not already loaded
    if (imgElement && (imgElement.complete || imgElement.naturalWidth > 0)) {
      setLoadedImages(prev => {
        // Only update if not already loaded to prevent infinite loops
        if (!prev.has(imageId)) {
          const newSet = new Set(prev);
          newSet.add(imageId);
          return newSet;
        }
        return prev;
      });
    }
  };

  // Safety check to ensure relatedImages is an array
  if (!relatedImages || !Array.isArray(relatedImages) || relatedImages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No related images found.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {relatedImages.map((img) => (
          <div
            key={img._id}
            className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative">
              {!loadedImages.has(img._id) && (
                <div className="absolute inset-0 w-full h-40 md:h-60 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer z-10 rounded-t-lg"></div>
              )}
              <Link href={`/${img.category.replace(/\s+/g, "-")}/${img.slug}`}>
            <img
              ref={(el) => {
                if (el && !imageRefs.current[img._id]) {
                  imageRefs.current[img._id] = el;
                  // Check if image is already loaded (only on first ref set)
                  if (el.complete && el.naturalWidth > 0 && !loadedImages.has(img._id)) {
                    handleImageLoad(img._id, el);
                  }
                }
              }}
              src={img.thumbnailUrl || img.imageUrl || "/img111.jpg"}
              alt={img.title}
              className="w-full h-40 md:h-60 object-cover hover:scale-105 transition-transform duration-300"
              loading="eager"
              decoding="sync"
              onLoad={(e) => {
                handleImageLoad(img._id, e.target);
              }}
              onError={(e) => {
                // Try fallback to main image if thumbnail fails
                if (e.target.src.includes(img.thumbnailUrl) && img.imageUrl) {
                  e.target.src = img.imageUrl;
                } else {
                  e.target.src = '/img111.jpg';
                }
                // Mark as loaded even on error to remove shimmer
                handleImageLoad(img._id, e.target);
              }}
            />
              </Link>
            </div>
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
  );
}
