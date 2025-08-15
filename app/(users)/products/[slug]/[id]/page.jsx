import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import Link from "next/link";
import { FaCrown, FaGift, FaEye, FaDownload, FaHeart, FaShare, FaStar, FaCheckCircle, FaShieldAlt, FaFileAlt, FaInfinity, FaReceipt, FaHome, FaTag, FaPhone, FaGlobe, FaMapMarkerAlt } from "react-icons/fa";
import ImageWithSkeleton from "../../../components/ImageWithSkeleton";

export async function generateMetadata({ params }) {
  await connectToDatabase();
  const { productSlug } = await params;
  const img = await ImageModel.findOne({ slug: productSlug });
  return {
    title: img?.title || "Image",
    description: img?.description || "Image detail",
  };
}

export default async function ProductDetailPage({ params }) {
  await connectToDatabase();
  const { slug: categorySlug, productSlug } = await params;
  
  // Find image by slug
  const image = await ImageModel.findOne({ slug: productSlug });

  if (!image) {
    return (
      <div className="px-6 py-10 bg-[#f4f8fc] min-h-screen">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Find related images based on category or tags
  const relatedImages = await ImageModel.aggregate([
    {
      $match: {
        category: image.category,
        _id: { $ne: image._id }, // Exclude the current image
      },
    },
    {
      $sample: { size: 8 },
    },
  ]);

  // Convert image data for DownloadSection
  const imageData = {
    _id: image._id.toString(),
    type: image.type,
    imageUrl: image.imageUrl,
    likes: image.likes || 0,
    category: image.category,
    description: image.description
  };

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      {/* Main Content Container */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/${image.category.replace(/\s+/g, "-")}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {image.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{image.title}</span>
        </nav>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 leading-tight">
          {image.title}
        </h1>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Product Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Product Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative">
                <ImageWithSkeleton
                  src={`${image.thumbnailUrl || image.imageUrl || "/img111.jpg"}?v=${Date.now()}`}
                  alt={image.title}
                  className="w-full h-auto object-contain"
                  thumbnailUrl={image.thumbnailUrl}
                  imageUrl={image.imageUrl}
                  skeletonClassName="animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] min-h-[400px]"
                />
                
                {/* Premium/Free Badge */}
                {image.type === "premium" && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold shadow-lg">
                      <FaCrown className="text-xs" />
                      Premium
                    </div>
                  </div>
                )}
                {image.type === "free" && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold shadow-lg">
                      <FaGift className="text-xs" />
                      Free
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Bar */}
            <div className="bg-yellow-400 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <FaMapMarkerAlt className="text-gray-700" />
                  <span className="text-gray-700 font-medium">home to home</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FaPhone className="text-gray-700" />
                  <span className="text-gray-700 font-medium">9166216422000000</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FaGlobe className="text-gray-700" />
                  <span className="text-gray-700 font-medium">vecteno.com</span>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <p className="text-gray-700 leading-relaxed text-base">
                {image.description || `Don't settle for dull visuals. Download our ${image.title} and bring your event to life. Our ${image.category} design collection features vibrant and festive options that will impress your audience and enhance your celebration.`}
              </p>
            </div>
          </div>

          {/* Right Column - Download Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
              {/* Copyright Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  This image is protected by copyright. For commercial use and license authorization, please{" "}
                  <Link href="/pricing" className="text-blue-600 underline hover:text-blue-800">
                    Upgrade to Individual Premium plan
                  </Link>
                  .
                </p>
              </div>

              {/* Download Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <FaDownload />
                  Free Download
                </button>
                <button className="w-full bg-yellow-500 text-black py-4 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2">
                  <FaCrown />
                  Go Premium
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button className="py-3 px-4 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <FaHeart />
                  Like
                </button>
                <button className="py-3 px-4 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <FaShare />
                  Share
                </button>
              </div>

              {/* Authorization Scope */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Authorization scope Commercial license</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Individual Authorization</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Copyright guaranteed
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      PRF license for Individual commercial use
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      No attribution or credit author
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Unlimited downloads of Premium assets
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Online invoice
                    </li>
                  </ul>
                  <button className="text-blue-600 text-sm underline hover:text-blue-800">
                    Free License
                  </button>
                </div>
              </div>

              {/* Crediting Section */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Crediting the author</h4>
              </div>
            </div>
          </div>
        </div>

        {/* More in this series Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">More in this series</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {relatedImages.map((img) => (
              <div
                key={img._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link href={`/${img.category.replace(/\s+/g, "-")}/${img.slug}`}>
                  <div className="relative">
                    <ImageWithSkeleton
                      src={`${img.thumbnailUrl || img.imageUrl || "/img111.jpg"}?v=${Date.now()}`}
                      alt={img.title}
                      className="w-full h-32 object-cover"
                      thumbnailUrl={img.thumbnailUrl}
                      imageUrl={img.imageUrl}
                      skeletonClassName="animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] h-32"
                    />
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      {img.type === "premium" ? (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <FaCrown className="text-xs" />
                          Premium
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <FaGift className="text-xs" />
                          Free
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-3">
                      {img.title}
                    </h3>
                    <button className={`w-full py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${
                      img.type === "premium" 
                        ? "bg-yellow-500 text-black hover:bg-yellow-600" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}>
                      <FaDownload className="text-xs" />
                      {img.type === "premium" ? "Premium Download" : "Free Download"}
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 