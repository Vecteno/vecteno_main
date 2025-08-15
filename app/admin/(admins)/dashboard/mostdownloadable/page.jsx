// app/admin/dashboard/trending/page.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const TrendingImagesAdmin = () => {
  const [trendingImages, setTrendingImages] = useState([]);

  const fetchTrendingImages = async () => {
    try {
      const res = await fetch("/api/images/trending");
      const data = await res.json();
      setTrendingImages(data);
    } catch (error) {
      console.error("Error fetching trending images:", error);
    }
  };


  const handleUnmarkTrending = async (id) => {
    const confirm = window.confirm("Remove this image from trending?");
    if (!confirm) return;

    try {
      const res = await fetch(`/api/images/${id}/trending`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isTrending: false }),
      });

      const data = await res.json();

      if (res.ok) {
        setTrendingImages((prev) => prev.filter((img) => img._id !== id));
        alert("Image removed from trending.");
      } else {
        alert(data.message || "Failed to update.");
      }
    } catch (error) {
      console.error("Trending unmark error:", error);
      alert("Failed to update.");
    }
  };

  useEffect(() => {
    fetchTrendingImages();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Trending Images</h1>
      {trendingImages.length === 0 ? (
        <p>No trending images found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingImages.map((img) => (
            <div
              key={img._id}
              className="border rounded-lg shadow-md p-2 relative"
            >
              <img
                src={img.thumbnailUrl || img.imageUrl}
                alt={img.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h2 className="font-semibold">{img.title}</h2>
              <button
                onClick={() => handleUnmarkTrending(img._id)}
                className="mt-3 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Remove from Trending
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingImagesAdmin;
