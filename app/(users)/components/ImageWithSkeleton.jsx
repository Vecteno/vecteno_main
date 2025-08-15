"use client";

import { useState } from 'react';

const ImageWithSkeleton = ({ 
  src, 
  alt, 
  className = "", 
  thumbnailUrl = null,
  imageUrl = null,
  skeletonClassName = "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = (e) => {
    console.log('Image failed to load:', e.target.src);
    
    // Try fallback to main image if thumbnail fails
    if (thumbnailUrl && imageUrl && e.target.src.includes(thumbnailUrl)) {
      e.target.src = `${imageUrl}?v=${Date.now()}`;
      return;
    }
    
    // Final fallback
    e.target.src = '/img111.jpg';
    setError(true);
    setLoading(false);
  };

  return (
    <div className="relative">
      {loading && (
        <div className={`absolute inset-0 ${skeletonClassName} rounded-lg`}>
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default ImageWithSkeleton;
