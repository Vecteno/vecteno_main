'use client';

import { useState, useEffect, useRef } from 'react';

export default function SkeletonImage({ src, alt, className, containerClassName = '', onImageLoad }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
      if (onImageLoad) onImageLoad();
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Force show image after timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (onImageLoad) onImageLoad();
    }, 2500);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      clearTimeout(timer);
    };
  }, [src, onImageLoad]);

  return (
    <div className={`relative ${containerClassName}`}>
      {/* YouTube-style Shimmer Skeleton Loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 rounded-md overflow-hidden">
          <div className="shimmer-wrapper">
            <div className="shimmer"></div>
          </div>
        </div>
      )}
      
      {/* Actual Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        style={{ 
          display: isLoading ? 'none' : 'block',
          opacity: hasError ? 0.5 : 1 
        }}
      />
      
      {/* Error fallback */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded-md">
          📷 Image unavailable
        </div>
      )}
      
      <style jsx>{`
        .shimmer-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}
