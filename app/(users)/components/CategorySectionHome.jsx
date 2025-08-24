"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success && data.categories.length > 0) {
          setCategories(data.categories.filter(cat => cat.showAsHome));
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Update itemsPerView on resize
  const updateItemsPerView = useCallback(() => {
    const w = window.innerWidth;
    if (w >= 1280) setItemsPerView(6);
    else if (w >= 1024) setItemsPerView(5);
    else if (w >= 768) setItemsPerView(3);
    else setItemsPerView(1);
  }, []);

  useEffect(() => {
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [updateItemsPerView]);

  // Slide next
  const nextSlide = useCallback(() => {
    if (isAnimating || categories.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => {
      const maxIndex = categories.length - itemsPerView;
      return prev >= maxIndex ? 0 : prev + 1;
    });
    setTimeout(() => {
      setIsAnimating(false);
    }, 350);
  }, [isAnimating, categories.length, itemsPerView]);

  // Slide previous
  const prevSlide = useCallback(() => {
    if (isAnimating || categories.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => {
      const maxIndex = categories.length - itemsPerView;
      return prev <= 0 ? maxIndex : prev - 1;
    });
    setTimeout(() => {
      setIsAnimating(false);
    }, 350);
  }, [isAnimating, categories.length, itemsPerView]);

  // Auto slide every 3.5s
  useEffect(() => {
    if (categories.length === 0) return;
    const interval = setInterval(nextSlide, 3500);
    return () => clearInterval(interval);
  }, [nextSlide, categories.length]);

  // Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current - touchEndX.current > 50) nextSlide();
    else if (touchEndX.current - touchStartX.current > 50) prevSlide();
  };

  if (loading) {
    return (
      <section className="py-12 px-4 bg-gradient-to-b from-gray-50 to-white font-inter">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Explore Categories
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto mb-8">
            Discover thousands of high-quality designs across various categories
          </p>
          <div className="flex justify-center space-x-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-48 h-56 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Width of each item as % of total slider track width (all items side by side)
  const itemWidthPercent = 100 / categories.length;

  // Calculate translateX in % (slide by one item at a time)
  const translateXPercent = currentIndex * itemWidthPercent;

  return (
    <section className="py-12 px-4 font-inter">
      <div className="mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Explore Categories
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Discover thousands of high-quality designs across various categories
          </p>
        </div>

        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            disabled={isAnimating}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.707 15.707a1 1 0 01-1.414 0L6.586 11l4.707-4.707a1 1 0 011.414 1.414L9.414 11l3.293 3.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            disabled={isAnimating}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 4.293a1 1 0 011.414 0L13.414 9l-4.707 4.707a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Slider Track */}
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              width: `${categories.length * (100 / itemsPerView)}%`,
              transform: `translateX(-${translateXPercent}%)`,
            }}
          >
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/${category.slug}/`}
                className="flex-shrink-0 px-3 md:px-4"
                style={{
                  width: `${itemWidthPercent}%`,
                }}
              >
                <div className="group block cursor-pointer rounded-lg overflow-hidden w-1/2 md:w-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white">
                  <div
                    className={`relative overflow-hidden border border-blue-400 rounded-t-lg ${
                      itemsPerView === 1 ? "h-56" : "pt-[100%]"
                    }`}
                  >
                    <img
                      src={category.image}
                      alt={category.label}
                      className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/400x400/4F46E5/FFFFFF?text=${encodeURIComponent(
                          category.label
                        )}`;
                      }}
                    />
                  </div>
                  <div className="h-12 rounded-b-lg bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                    <span className="text-white font-semibold text-base text-center px-2 truncate">
                      {category.label}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
