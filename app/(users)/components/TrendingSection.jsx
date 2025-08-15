// components/TrendingSection.jsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaHeart, FaCrown } from 'react-icons/fa';

const TrendingSection = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/images/trending');
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to fetch trending images'}`);
        }
        
        const data = await res.json();
        
        // Get all trending images (both premium and free)
        const trendingImages = Array.isArray(data) 
          ? data.filter(image => image && image.isTrending) 
          : [];
          
        setImages(trendingImages.slice(0, 5));
        setError(null);
      } catch (err) {
        console.error('Failed to fetch trending images:', err);
        setError(err.message || 'Failed to load trending images');
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto px-4 py-10 max-w-[1280px]">
        <h2 className="text-lg md:text-2xl underline font-semibold mb-6">Trending Images</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Large left skeleton */}
          <div className="lg:col-span-2">
            <div className="relative h-[500px] rounded-lg overflow-hidden shadow-lg">
              <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
              {/* Skeleton tag */}
              <div className="absolute top-3 right-3">
                <div className="bg-gray-300 animate-pulse h-6 w-28 rounded-md"></div>
              </div>
            </div>
          </div>
          
          {/* Four smaller skeletons */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative h-[240px] rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
                {/* Skeleton tag */}
                <div className="absolute top-2 right-2">
                  <div className="bg-gray-300 animate-pulse h-5 w-20 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !images.length) {
    return (
      <section className="mx-auto px-4 py-10 max-w-[1280px]">
        <h2 className="text-lg md:text-2xl underline font-semibold mb-6">Trending Images</h2>
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {error || 'No trending images available at the moment.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto px-4 py-10 max-w-[1280px]">
      <h2 className="text-lg md:text-2xl underline font-semibold mb-6">Trending Images</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Large left image */}
        <div className="lg:col-span-2">
          {images[0] && (
            <Link href={`/${images[0].category.replace(/\s+/g, "-")}/${images[0].slug}`}>
              <div className="relative h-full rounded-lg overflow-hidden shadow-lg group cursor-pointer">
                <img
                  src={`${images[0].thumbnailUrl || images[0].imageUrl || "/img111.jpg"}?v=${Date.now()}`}
                  alt={images[0].title}
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.log('Trending large image failed to load:', e.target.src);
                    if (e.target.src.includes(images[0].thumbnailUrl) && images[0].imageUrl) {
                      e.target.src = `${images[0].imageUrl}?v=${Date.now()}`;
                    } else {
                      e.target.src = '/img111.jpg';
                    }
                  }}
                />
                {/* Premium Download Tag */}
                <div className="absolute top-3 right-3">
                  <span className="bg-yellow-400 border border-black text-black px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1 shadow-lg">
                    <FaCrown className="text-xs" />
                    Premium Download
                  </span>
                </div>
                {/* <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                  <h3 className="text-lg font-semibold">{images[0].title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <FaHeart className="text-red-500" />
                    {images[0].likes}
                  </div>
                </div> */}
              </div>
            </Link>
          )}
        </div>

        {/* Four stacked images on the right */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {images.slice(1).map((image) => (
            <Link key={image._id} href={`/${image.category.replace(/\s+/g, "-")}/${image.slug}`}>
              <div className="group relative h-[240px] rounded-lg overflow-hidden shadow-lg cursor-pointer">
                <img
                  src={`${image.thumbnailUrl || image.imageUrl}?v=${image.updatedAt || image.createdAt || Date.now()}`}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Premium Download Tag */}
                <div className="absolute top-2 right-2">
                  <span className="bg-yellow-400 border border-black text-black px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <FaCrown className="text-xs" />
                    Premium Download
                  </span>
                </div>
                {/* <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                  <h3 className="text-md font-medium truncate">{image.title}</h3>
                  <div className="text-sm text-gray-200 flex items-center gap-1 mt-1">
                    <FaHeart className="text-red-500" /> {image.likes}
                  </div>
                </div> */}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
