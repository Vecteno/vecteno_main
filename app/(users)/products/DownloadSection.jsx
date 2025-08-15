"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaDownload, FaShare, FaHeart, FaCrown, FaGift, FaLock, FaUser, FaArrowRight, FaInfo, FaEye } from "react-icons/fa";

const DownloadSection = ({ image }) => {
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(image.likes || 0);
  const [refreshing, setRefreshing] = useState(false);

  // Debug: Log image data to see what's available
  console.log("Image data in DownloadSection:", image);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profileInfo?t=" + Date.now(), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setIsAuthenticated(true);
        setIsPremiumUser(data.user.isPremium);
        console.log('DownloadSection - User premium status:', data.user.isPremium);
      } catch (err) {
        console.error("User not authenticated");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleNotAllowed = () => {
    toast.error("This is a premium asset. Please upgrade to download.");
  };

  const handleLoginPrompt = () => {
    toast.error("Please log in to download this image.");
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to like this image.");
      return;
    }

    try {
      const res = await fetch("/api/images/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId: image._id }),
      });

      const data = await res.json();
      if (data.success) {
        setLiked(data.liked);
        setLikes(data.likes);
        toast.success(data.liked ? "Image liked!" : "Like removed!");
      } else {
        toast.error(data.message || "Failed to like image.");
      }
    } catch (err) {
      toast.error("Error while liking image");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  const handleRefreshPremiumStatus = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/refresh-premium', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsPremiumUser(data.isPremium);
        toast.success("Premium status refreshed!");
        console.log('Premium status refreshed:', data.isPremium);
      } else {
        toast.error("Failed to refresh status.");
      }
    } catch (err) {
      toast.error("Error refreshing status.");
    } finally {
      setRefreshing(false);
    }
  };

  const downloadUrl = image.imageUrl.replace(
    "/upload/",
    "/upload/fl_attachment/"
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Copyright Notice Skeleton */}
        <div className="bg-gray-200 border border-gray-300 rounded-lg p-3 sm:p-4">
          <div className="h-4 bg-gray-300 rounded w-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        </div>
        
        {/* Download Buttons Skeleton */}
        <div className="space-y-3">
          <div className="w-full h-12 sm:h-14 bg-gray-300 rounded-lg animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
          <div className="w-full h-12 sm:h-14 bg-gray-300 rounded-lg animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        </div>
        
        {/* Action Buttons Skeleton */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 sm:h-12 bg-gray-300 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Copyright Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          This image is protected by copyright. For commercial use and license authorization, please Upgrade to Individual Premium plan
        </p>
      </div>

      {/* Download Buttons */}
      <div className="space-y-3">
        {!isAuthenticated ? (
          // Not logged in
          <div className="space-y-3">
            {image.type === "premium" ? (
              // Premium product - show upgrade button
              <Link
                href="/pricing"
                className="w-full bg-yellow-500 text-black py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaCrown className="text-sm sm:text-base" />
                Upgrade to Download
              </Link>
            ) : (
              // Free product - show login button
              <button
                onClick={handleLoginPrompt}
                className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaDownload className="text-sm sm:text-base" />
                Free Download
              </button>
            )}
            {image.type === "premium" ? (
              <Link
                href="/"
                className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Continue with Free
              </Link>
            ) : (
              <Link
                href="/pricing"
                className="w-full bg-yellow-500 text-black py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaCrown className="text-sm sm:text-base" />
                Go Premium
              </Link>
            )}
          </div>
        ) : image.type === "premium" && !isPremiumUser ? (
          // Premium image but user not premium
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="w-full bg-yellow-500 text-black py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaCrown className="text-sm sm:text-base" />
              Upgrade to Download
            </Link>
            <Link
              href="/"
              className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Continue with Free
            </Link>
          </div>
        ) : (
          // User can download
          <div className="space-y-3">
            <a
              href={downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                image.type === "premium"
                  ? "bg-yellow-500 text-black hover:bg-yellow-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <FaDownload className="text-sm sm:text-base" />
              {image.type === "premium" ? "Download Premium" : "Free Download"}
            </a>
            {image.type === "free" && (
              <Link
                href="/pricing"
                className="w-full bg-yellow-500 text-black py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaCrown className="text-sm sm:text-base" />
                Go Premium
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        
        <button
          onClick={handleLike}
          className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
            liked
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <FaHeart className="text-xs sm:text-sm" />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button
          onClick={handleShare}
          className="py-2 sm:py-3 px-2 sm:px-4 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <FaShare className="text-xs sm:text-sm" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          onClick={handleRefreshPremiumStatus}
          disabled={refreshing}
          className={`py-2 sm:py-3 px-2 sm:px-4 bg-green-200 text-green-700 hover:bg-green-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
            refreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className={`text-xs sm:text-sm ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
          <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaInfo className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-gray-600 text-lg">✕</span>
              </button>
            </div>

            

                         {/* Product Information */}
             <div className="space-y-5">
                                               {/* Description */}
                 <div className="bg-gray-50 p-4 rounded-xl">
                   <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Description</h4>
                   <p className="text-gray-700 leading-relaxed">
                     {image.description || "No description available for this product."}
                   </p>
                 </div>

               {/* Likes */}
               <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-100">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Popularity</h4>
                 <div className="flex items-center gap-2">
                   <FaHeart className="text-red-500 text-lg" />
                   <span className="font-semibold text-gray-900">{likes} likes</span>
                 </div>
               </div>

               {/* Category */}
               <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Category</h4>
                 <p className="font-semibold text-gray-900 capitalize">{image.category}</p>
               </div>
             </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadSection;

