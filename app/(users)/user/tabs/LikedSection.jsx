"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function LikedImagesPage() {
  const [likedImages, setLikedImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedImages = async () => {
      try {
        const res = await axios.get("/api/user/liked");
        console.log("Response from /api/user/liked:", res); // 👈 log here
        console.log("Fetched liked images:", res.data.images); // 👈 log here
        setLikedImages(res.data.images);
      } catch (err) {
        console.error("Failed to load liked images:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedImages();
  }, []);

  if (loading) return <p className="text-center py-10">Loading...</p>;

  if (likedImages.length === 0)
    return <p className="text-center py-10">No liked images found.</p>;

  return (
    <div className="p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {likedImages.map((image) => (
        <Link
          href={`/${image.category.replace(/\s+/g, "-")}/${image.slug}`}
          key={image._id}
          className="border rounded-xl overflow-hidden shadow hover:shadow-md transition duration-300"
        >
          <img
            src={image.thumbnailUrl || image.imageUrl}
            alt={image.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h2 className="font-semibold text-lg">{image.title}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
}
