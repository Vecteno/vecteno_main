"use client";

import Link from "next/link";
import { FaCrown, FaGift, FaDownload, FaHeart, FaShare } from "react-icons/fa";
import ImageWithWatermarks from "../../components/ImageWithWatermarks";
import RelatedImagesGrid from "../../components/RelatedImagesGrid";
import React, { useEffect, useState } from "react";
import { useCustomSession } from "../../../components/CustomSessionProvider";

export default function ProductDetailPage({ params }) {
  const { data: session, status } = useCustomSession();
  const { slug } = params;
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedImages, setRelatedImages] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userPlan, setUserPlan] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Fetch user plan from profileInfo API
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/profileInfo?t=" + Date.now(), {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.user && data.user.isPremium) {
              setUserPlan({
                name: "Premium Plan",
                status: "active",
                type: "premium",
                level: 1,
                expiresAt: data.user.premiumExpiresAt,
              });
            } else {
              setUserPlan(null);
            }
          } else {
            if (response.status === 401) setUserPlan(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserPlan(null);
      }
    };
    fetchUserPlan();
  }, [session]);

  // Like button handler
  const handleLike = async () => {
    if (status === "loading") {
      alert("Loading authentication status, please try again...");
      return;
    }

    if (!session?.user || status === "unauthenticated") {
      alert("Please login to like images!");
      window.location.href = "/login";
      return;
    }

    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await fetch("/api/images/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: image._id }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsLiked(data.liked);
          setLikeCount(data.likes);
        } else {
          alert(data.message || "Failed to like image. Please try again.");
        }
      } else {
        alert("Failed to like image. Please try again.");
      }
    } catch (error) {
      console.error("Error liking image:", error);
      alert("Failed to like image. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  // Download handler with permission logic
  const handleDownload = async () => {
    if (!session?.user) {
      window.location.href = "/login";
      return;
    }
    if (
      image.type === "premium" &&
      (!userPlan || userPlan.status !== "active" || userPlan.type !== "premium")
    ) {
      window.location.href = "/pricing";
      return;
    }
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/images/download/${image.slug}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        let errorMsg = "An error occurred while downloading";
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (jsonErr) {
          // Not JSON, keep default message
        }
        alert(errorMsg);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${image.title}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("An error occurred while downloading");
    } finally {
      setIsDownloading(false);
    }
  };

  // Share handler
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: image.title,
          text: `Check out this ${image.category} design: ${image.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Download button config logic (for button text and click)
  const getDownloadButtonConfig = () => {
    if (!session?.user) {
      return {
        text: "Login to Download",
        onClick: () => (window.location.href = "/login"),
        disabled: false,
        className:
          "w-full bg-gray-600 text-white py-4 px-6 font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 cursor-pointer",
      };
    }
    if (image.type === "free") {
      return {
        text: "Free Download",
        onClick: handleDownload,
        disabled: isDownloading,
        className:
          "w-full bg-blue-600 text-white py-4 px-6 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer",
      };
    }
    if (image.type === "premium") {
      if (
        userPlan &&
        userPlan.status === "active" &&
        userPlan.type === "premium"
      ) {
        return {
          text: "Premium Download",
          onClick: handleDownload,
          disabled: isDownloading,
          className:
            "w-full bg-yellow-500 text-black py-4 px-6 font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 cursor-pointer",
        };
      } else {
        return {
          text: "Upgrade to Premium",
          onClick: () => (window.location.href = "/pricing"),
          disabled: false,
          className:
            "w-full bg-yellow-500 text-black py-4 px-6 font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 cursor-pointer",
        };
      }
    }
  };

  // Check if user has already liked image
  const checkLikeStatus = async (imageData) => {
    if (!session?.user || !imageData) return;
    try {
      if (imageData.likedBy && Array.isArray(imageData.likedBy)) {
        const userHasLiked = imageData.likedBy.some(
          (userId) => userId?.toString() === session.user.id?.toString()
        );
        setIsLiked(userHasLiked);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  // Fetch image + related images
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/images/by-slug/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setImage(data.image);
          setRelatedImages(data.relatedImages);
          setLikeCount(data.image.likes || 0);
          checkLikeStatus(data.image);
        } else {
          setImage(null);
        }
      } catch (error) {
        console.error("Error fetching image data:", error);
        setImage(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  // Re-check like status on session change
  useEffect(() => {
    if (image && session?.user) {
      checkLikeStatus(image);
    }
  }, [session, image]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center cursor-pointer">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-[#f4f8fc] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Product Not Found
        </h1>
        <div>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/${image.category.replace(/\s+/g, "-")}`}
            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            {image.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">
            {image.title}
          </span>
        </nav>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 leading-tight">
          {image.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Product Image with Watermarks */}
            <div className="bg-white shadow-lg overflow-hidden">
              <div className="relative">
                <ImageWithWatermarks
                  src={image.thumbnailUrl || image.imageUrl}
                  alt={image.title}
                  className="w-full h-auto object-contain"
                />

                {/* Premium/Free Badge */}
                {image.type === "premium" && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-700 text-black px-3 py-1 flex items-center gap-1 text-sm font-semibold shadow-lg cursor-pointer">
                      <FaCrown className="text-xs" />
                      Premium
                    </div>
                  </div>
                )}
                {image.type === "free" && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-700 text-white px-3 py-1 flex items-center gap-1 text-sm font-semibold shadow-lg cursor-pointer">
                      <FaGift className="text-xs" />
                      Free
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white p-6 shadow-lg">
              <p className="text-gray-700 leading-relaxed text-base">
                {image.description ||
                  `Don't settle for dull visuals. Download our ${image.title} and bring your event to life. Our ${image.category} design collection features vibrant and festive options that will impress your audience and enhance your celebration.`}
              </p>
            </div>
          </div>

          {/* Right Column - Download Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-lg space-y-6 sticky top-6">
              {/* Premium Status */}
              {userPlan &&
              userPlan.status === "active" &&
              userPlan.type === "premium" ? (
                <div className="bg-green-50 border border-green-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCrown className="text-yellow-500 cursor-pointer" />
                    <h4 className="font-semibold text-green-800 cursor-pointer">
                      Premium Active
                    </h4>
                  </div>
                  <p className="text-sm text-green-700 cursor-pointer">
                    You have access to all premium content. Plan:{" "}
                    <strong>{userPlan.name}</strong>
                  </p>
                  {userPlan.expiresAt && (
                    <p className="text-xs text-green-600 mt-1 cursor-pointer">
                      Expires:{" "}
                      {new Date(userPlan.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4">
                  <p className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                    This image is protected by copyright. For commercial use and
                    license authorization, please{" "}
                    <Link
                      href="/pricing"
                      className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                    >
                      Upgrade to Individual Premium plan
                    </Link>
                    .
                  </p>
                </div>
              )}

              {/* Download Buttons */}
              <div className="space-y-3">
                {(() => {
                  const btn = getDownloadButtonConfig();
                  return (
                    <button
                      onClick={btn.onClick}
                      disabled={btn.disabled}
                      className={btn.className}
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FaDownload className="cursor-pointer" />
                          {btn.text}
                        </>
                      )}
                    </button>
                  );
                })()}

                {/* Premium/Free other buttons here */}
                {image.type === "premium" ? (
                  <button
                    onClick={() => (window.location.href = "/products")}
                    className="w-full bg-blue-600 text-white py-4 px-6 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaGift className="cursor-pointer" />
                    Explore Free
                  </button>
                ) : (
                  <button
                    onClick={() => (window.location.href = "/pricing")}
                    className="w-full bg-yellow-500 text-black py-4 px-6 font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaCrown className="cursor-pointer" />
                    Go Premium
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between space-x-4">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isLiked
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isLiking ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaHeart
                      className={
                        isLiked ? "text-white cursor-pointer" : "cursor-pointer"
                      }
                    />
                  )}
                  {/* Always show total likes */}
                  <span>
                    {likeCount} {likeCount === 1 ? "Like" : "Likes"}
                  </span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-3 px-4 bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaShare className="cursor-pointer" />
                  Share
                </button>
              </div>

              {/* Authorization Scope */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 cursor-pointer">
                  Authorization scope Commercial license
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 cursor-pointer">
                    Individual Authorization
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <div className="w-2 h-2 bg-blue-500 cursor-pointer"></div>
                      Copyright guaranteed
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <div className="w-2 h-2 bg-blue-500 cursor-pointer"></div>
                      PRF license for Individual commercial use
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <div className="w-2 h-2 bg-blue-500 cursor-pointer"></div>
                      No attribution or credit author
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <div className="w-2 h-2 bg-blue-500 cursor-pointer"></div>
                      Unlimited downloads of Premium assets
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <div className="w-2 h-2 bg-blue-500 cursor-pointer"></div>
                      Online invoice
                    </li>
                  </ul>
                  <button className="text-blue-600 text-sm underline hover:text-blue-800 cursor-pointer">
                    Free License
                  </button>
                </div>
              </div>

              {/* Crediting Section */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 cursor-pointer">
                  Vecteno.com
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* More in this series Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 cursor-pointer">
            More in this series
          </h2>
          <RelatedImagesGrid
            relatedImages={relatedImages}
            categorySlug={image.category}
          />
        </div>
      </div>
    </div>
  );
}

// "use client";

// import Link from "next/link";
// import { FaCrown, FaGift, FaDownload, FaHeart, FaShare } from "react-icons/fa";
// import ImageWithWatermarks from "../../components/ImageWithWatermarks";
// import RelatedImagesGrid from "../../components/RelatedImagesGrid";
// import React, { useEffect, useState } from "react";
// import { useCustomSession } from "../../../components/CustomSessionProvider";

// export default function ProductDetailPage({ params }) {
//   const { data: session, status } = useCustomSession();
//   const { slug } = params;
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [relatedImages, setRelatedImages] = useState([]);
//   const [isLiked, setIsLiked] = useState(false);
//   const [likeCount, setLikeCount] = useState(0);
//   const [userPlan, setUserPlan] = useState(null);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [isLiking, setIsLiking] = useState(false);

//   // Fetch user plan from profileInfo API
//   useEffect(() => {
//     const fetchUserPlan = async () => {
//       if (session?.user) {
//         try {
//           const response = await fetch("/api/profileInfo?t=" + Date.now(), {
//             cache: "no-store",
//             headers: {
//               "Cache-Control": "no-cache, no-store, must-revalidate",
//               Pragma: "no-cache",
//               Expires: "0",
//             },
//           });
//           if (response.ok) {
//             const data = await response.json();
//             if (data.user && data.user.isPremium) {
//               setUserPlan({
//                 name: "Premium Plan",
//                 status: "active",
//                 type: "premium",
//                 level: 1,
//                 expiresAt: data.user.premiumExpiresAt,
//               });
//             } else {
//               setUserPlan(null);
//             }
//           } else {
//             if (response.status === 401) setUserPlan(null);
//           }
//         } catch (error) {
//           console.error("Error fetching user profile:", error);
//         }
//       } else {
//         setUserPlan(null);
//       }
//     };
//     fetchUserPlan();
//   }, [session]);

//   // Like button handler
//   const handleLike = async () => {
//     if (status === "loading") {
//       alert("Loading authentication status, please try again...");
//       return;
//     }

//     if (!session?.user || status === "unauthenticated") {
//       alert("Please login to like images!");
//       window.location.href = "/login";
//       return;
//     }

//     if (isLiking) return;

//     try {
//       setIsLiking(true);
//       const response = await fetch("/api/images/like", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ imageId: image._id }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           setIsLiked(data.liked);
//           setLikeCount(data.likes);
//         } else {
//           alert(data.message || "Failed to like image. Please try again.");
//         }
//       } else {
//         alert("Failed to like image. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error liking image:", error);
//       alert("Failed to like image. Please try again.");
//     } finally {
//       setIsLiking(false);
//     }
//   };

//   // Download handler with permission logic
//   const handleDownload = async () => {
//     if (!session?.user) {
//       window.location.href = "/login";
//       return;
//     }
//     if (image.type === "premium" && (!userPlan || userPlan.status !== "active" || userPlan.type !== "premium")) {
//       window.location.href = "/pricing";
//       return;
//     }
//     setIsDownloading(true);
//     try {
//       const response = await fetch(`/api/images/download/${image.slug}`, {
//         method: "GET",
//         credentials: "include",
//       });
//       if (!response.ok) {
//         let errorMsg = "An error occurred while downloading";
//         try {
//           const errorData = await response.json();
//           if (errorData && errorData.error) {
//             errorMsg = errorData.error;
//           }
//         } catch (jsonErr) {
//           // Not JSON, keep default message
//         }
//         alert(errorMsg);
//         return;
//       }
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${image.title}.zip`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Download error:", error);
//       alert("An error occurred while downloading");
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   // Share handler
//   const handleShare = async () => {
//     try {
//       if (navigator.share) {
//         await navigator.share({
//           title: image.title,
//           text: `Check out this ${image.category} design: ${image.title}`,
//           url: window.location.href,
//         });
//       } else {
//         await navigator.clipboard.writeText(window.location.href);
//         alert("Link copied to clipboard!");
//       }
//     } catch (error) {
//       console.error("Error sharing:", error);
//     }
//   };

//   // Download button config logic (for button text and click)
//   const getDownloadButtonConfig = () => {
//     if (!session?.user) {
//       return {
//         text: "Login to Download",
//         onClick: () => (window.location.href = "/login"),
//         disabled: false,
//         className:
//           "w-full bg-gray-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2",
//       };
//     }
//     if (image.type === "free") {
//       return {
//         text: "Free Download",
//         onClick: handleDownload,
//         disabled: isDownloading,
//         className:
//           "w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2",
//       };
//     }
//     if (image.type === "premium") {
//       if (userPlan && userPlan.status === "active" && userPlan.type === "premium") {
//         return {
//           text: "Premium Download",
//           onClick: handleDownload,
//           disabled: isDownloading,
//           className:
//             "w-full bg-yellow-500 text-black py-4 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2",
//         };
//       } else {
//         return {
//           text: "Upgrade to Premium",
//           onClick: () => (window.location.href = "/pricing"),
//           disabled: false,
//           className:
//             "w-full bg-yellow-500 text-black py-4 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2",
//         };
//       }
//     }
//   };

//   // Check if user has already liked image
//   const checkLikeStatus = async (imageData) => {
//     if (!session?.user || !imageData) return;
//     try {
//       if (imageData.likedBy && Array.isArray(imageData.likedBy)) {
//         const userHasLiked = imageData.likedBy.some(
//           (userId) => userId?.toString() === session.user.id?.toString()
//         );
//         setIsLiked(userHasLiked);
//       }
//     } catch (error) {
//       console.error("Error checking like status:", error);
//     }
//   };

//   // Fetch image + related images
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`/api/images/by-slug/${slug}`);
//         if (response.ok) {
//           const data = await response.json();
//           setImage(data.image);
//           setRelatedImages(data.relatedImages);
//           setLikeCount(data.image.likes || 0);
//           checkLikeStatus(data.image);
//         } else {
//           setImage(null);
//         }
//       } catch (error) {
//         console.error("Error fetching image data:", error);
//         setImage(null);
//       }
//       setLoading(false);
//     };
//     fetchData();
//   }, [slug]);

//   // Re-check like status on session change
//   useEffect(() => {
//     if (image && session?.user) {
//       checkLikeStatus(image);
//     }
//   }, [session, image]);

//   if (loading || status === "loading") {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="loader">Loading...</div>
//       </div>
//     );
//   }

//   if (!image) {
//     return (
//       <div className="min-h-screen bg-[#f4f8fc] flex flex-col items-center justify-center">
//         <h1 className="text-2xl font-bold text-gray-800 mb-4">
//           Product Not Found
//         </h1>
//         <div>
//           <p className="text-gray-600 mb-6">
//             The product you're looking for doesn't exist.
//           </p>
//           <Link
//             href="/products"
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Back to Products
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-blue-100">
//       <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Breadcrumbs */}
//         <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
//           <Link
//             href="/"
//             className="text-blue-600 hover:text-blue-800 transition-colors"
//           >
//             Home
//           </Link>
//           <span>/</span>
//           <Link
//             href={`/${image.category.replace(/\s+/g, "-")}`}
//             className="text-blue-600 hover:text-blue-800 transition-colors"
//           >
//             {image.category}
//           </Link>
//           <span>/</span>
//           <span className="text-gray-900 font-medium truncate">
//             {image.title}
//           </span>
//         </nav>

//         {/* Main Title */}
//         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 leading-tight">
//           {image.title}
//         </h1>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Product Display */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Main Product Image with Watermarks */}
//             <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//               <div className="relative">
//                 <ImageWithWatermarks
//                   src={image.thumbnailUrl || image.imageUrl}
//                   alt={image.title}
//                   className="w-full h-auto object-contain"
//                 />

//                 {/* Premium/Free Badge */}
//                 {image.type === "premium" && (
//                   <div className="absolute top-4 left-4">
//                     <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold shadow-lg">
//                       <FaCrown className="text-xs" />
//                       Premium
//                     </div>
//                   </div>
//                 )}
//                 {image.type === "free" && (
//                   <div className="absolute top-4 left-4">
//                     <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold shadow-lg">
//                       <FaGift className="text-xs" />
//                       Free
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Product Description */}
//             <div className="bg-white rounded-2xl p-6 shadow-lg">
//               <p className="text-gray-700 leading-relaxed text-base">
//                 {image.description ||
//                   `Don't settle for dull visuals. Download our ${image.title} and bring your event to life. Our ${image.category} design collection features vibrant and festive options that will impress your audience and enhance your celebration.`}
//               </p>
//             </div>
//           </div>

//           {/* Right Column - Download Section */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6 sticky top-6">
//               {/* Premium Status */}
//               {userPlan &&
//               userPlan.status === "active" &&
//               userPlan.type === "premium" ? (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FaCrown className="text-yellow-500" />
//                     <h4 className="font-semibold text-green-800">
//                       Premium Active
//                     </h4>
//                   </div>
//                   <p className="text-sm text-green-700">
//                     You have access to all premium content. Plan:{" "}
//                     <strong>{userPlan.name}</strong>
//                   </p>
//                   {userPlan.expiresAt && (
//                     <p className="text-xs text-green-600 mt-1">
//                       Expires:{" "}
//                       {new Date(userPlan.expiresAt).toLocaleDateString()}
//                     </p>
//                   )}
//                 </div>
//               ) : (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                   <p className="text-sm text-gray-700 leading-relaxed">
//                     This image is protected by copyright. For commercial use and
//                     license authorization, please{" "}
//                     <Link
//                       href="/pricing"
//                       className="text-blue-600 underline hover:text-blue-800"
//                     >
//                       Upgrade to Individual Premium plan
//                     </Link>
//                     .
//                   </p>
//                 </div>
//               )}

//               {/* Download Buttons */}
//               <div className="space-y-3">
//                 {(() => {
//                   const btn = getDownloadButtonConfig();
//                   return (
//                     <button
//                       onClick={btn.onClick}
//                       disabled={btn.disabled}
//                       className={btn.className}
//                     >
//                       {isDownloading ? (
//                         <>
//                           <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
//                           Downloading...
//                         </>
//                       ) : (
//                         <>
//                           <FaDownload />
//                           {btn.text}
//                         </>
//                       )}
//                     </button>
//                   );
//                 })()}

//                 {/* Premium/Free other buttons here */}
//                 {image.type === "premium" ? (
//                   <button
//                     onClick={() => (window.location.href = "/products")}
//                     className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
//                   >
//                     <FaGift />
//                     Explore Free
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => (window.location.href = "/pricing")}
//                     className="w-full bg-yellow-500 text-black py-4 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
//                   >
//                     <FaCrown />
//                     Go Premium
//                   </button>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex items-center justify-between space-x-4">
//                 <button
//                   onClick={handleLike}
//                   disabled={isLiking}
//                   className={`py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
//                     isLiked
//                       ? "bg-red-500 text-white hover:bg-red-600"
//                       : "bg-red-100 text-red-700 hover:bg-red-200"
//                   } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
//                 >
//                   {isLiking ? (
//                     <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
//                   ) : (
//                     <FaHeart className={isLiked ? "text-white" : ""} />
//                   )}
//                   {isLiked ? `${likeCount}` : "Like"}
//                 </button>
//                 <button
//                   onClick={handleShare}
//                   className="py-3 px-4 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
//                 >
//                   <FaShare />
//                   Share
//                 </button>
//               </div>

//               {/* Authorization Scope */}
//               <div className="space-y-4">
//                 <h3 className="text-lg font-bold text-gray-900">
//                   Authorization scope Commercial license
//                 </h3>
//                 <div className="space-y-2">
//                   <p className="text-sm text-gray-600">
//                     Individual Authorization
//                   </p>
//                   <ul className="space-y-2">
//                     <li className="flex items-center gap-2 text-sm text-gray-700">
//                       <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                       Copyright guaranteed
//                     </li>
//                     <li className="flex items-center gap-2 text-sm text-gray-700">
//                       <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                       PRF license for Individual commercial use
//                     </li>
//                     <li className="flex items-center gap-2 text-sm text-gray-700">
//                       <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                       No attribution or credit author
//                     </li>
//                     <li className="flex items-center gap-2 text-sm text-gray-700">
//                       <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                       Unlimited downloads of Premium assets
//                     </li>
//                     <li className="flex items-center gap-2 text-sm text-gray-700">
//                       <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                       Online invoice
//                     </li>
//                   </ul>
//                   <button className="text-blue-600 text-sm underline hover:text-blue-800">
//                     Free License
//                   </button>
//                 </div>
//               </div>

//               {/* Crediting Section */}
//               <div className="pt-4 border-t border-gray-200">
//                 <h4 className="text-sm font-medium text-gray-900">
//                   Vecteno.com
//                 </h4>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* More in this series Section */}
//         <div className="mt-16">
//           <h2 className="text-2xl font-bold text-gray-900 mb-8">
//             More in this series
//           </h2>
//           <RelatedImagesGrid
//             relatedImages={relatedImages}
//             categorySlug={image.category}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
