"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function BannerUpload() {
  const [image, setImage] = useState(null);
  const [mainHeading, setMainHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [currentBannerUrl, setCurrentBannerUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/admin/homepage");
        const data = await res.json();
        if (res.ok && data?.data) {
          setCurrentBannerUrl(data.data.heroImageUrl);
          setMainHeading(data.data.mainHeading || "");
          setSubHeading(data.data.subHeading || "");
        }
      } catch (err) {
        console.error("Failed to fetch banner:", err);
      }
    };
    fetchBanner();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("mainHeading", mainHeading);
    formData.append("subHeading", subHeading);

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Banner and text updated successfully!");
        setCurrentBannerUrl(data.data.heroImageUrl);
      } else {
        toast.error(data.error || "❌ Failed to update.");
      }
    } catch (err) {
      toast.error("❌ Something went wrong. Try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-pink-100 flex items-center justify-center px-4 py-10">
      <Toaster position="top-center" />
      <div className="w-full max-w-xl bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          🖼️ Update Homepage Banner & Text
        </h2>

        {currentBannerUrl ? (
          <div className="mb-6">
            <p className="text-gray-600 font-medium mb-2">Current Banner Preview:</p>
            <div className="overflow-hidden rounded-lg shadow-md border">
              <img
                src={currentBannerUrl}
                alt="Current Banner"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mb-6 text-center">No banner set yet.</p>
        )}

        <form onSubmit={handleUpload} className="space-y-5">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Main Heading</label>
            <input
              type="text"
              value={mainHeading}
              onChange={(e) => setMainHeading(e.target.value)}
              placeholder="Enter main heading"
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Subheading</label>
            <input
              type="text"
              value={subHeading}
              onChange={(e) => setSubHeading(e.target.value)}
              placeholder="Enter subheading"
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm"
              disabled={isUploading}
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-3 font-semibold rounded-full shadow-md transition duration-200 ${
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:opacity-90"
            }`}
          >
            {isUploading ? "⏳ Updating..." : "🚀 Update Banner & Text"}
          </button>
        </form>
      </div>
    </div>
  );
}
