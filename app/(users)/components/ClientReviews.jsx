"use client";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";

const ClientReviews = () => {
  const reviews = [
    {
      name: "Jitendra Rajpurohit",
      review:
        "Absolutely love Vecteno! The team was professional and the experience was outstanding. The quality of graphics is exceptional.",
      role: "CEO, Vecteno",
      avatar: "https://i.pravatar.cc/100?img=64",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      review:
        "Very reliable support. The Graphics and Images are fantastic and helped our business grow significantly. Thank You Vecteno!",
      role: "Marketing Director, TechCorp",
      avatar: "https://i.pravatar.cc/100?img=70",
      rating: 5,
    },
    {
      name: "Rahul Kumar",
      review:
        "I Highly recommend Vecteno! The premium features are worth every penny. Will definitely use again for future projects.",
      role: "Product Designer, StartupXYZ",
      avatar: "https://i.pravatar.cc/100?img=51",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      review:
        "Amazing collection of design resources! Vecteno has everything I need for my creative projects. The download speed is also great.",
      role: "Freelance Designer",
      avatar: "https://i.pravatar.cc/100?img=45",
      rating: 5,
    },
    {
      name: "David Chen",
      review:
        "Professional quality graphics at affordable prices. The customer service team is very responsive and helpful.",
      role: "Creative Director, MediaHouse",
      avatar: "https://i.pravatar.cc/100?img=32",
      rating: 5,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get max slides based on screen size
  const getMaxSlides = () => {
    return isMobile ? reviews.length : Math.max(0, reviews.length - 2);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlides = getMaxSlides();
        return (prev + 1) % maxSlides;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length, isMobile]);

  const nextSlide = () => {
    const maxSlides = getMaxSlides();
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    const maxSlides = getMaxSlides();
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            What Our Creators Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied designers and creators who trust Vecteno for their creative needs
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-7xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentSlide * (isMobile ? 100 : 33.333)}%)` 
              }}
            >
              {reviews.map((review, index) => (
                <div key={index} className={`flex-shrink-0 px-2 md:px-4 ${isMobile ? 'w-full' : 'w-1/3'}`}>
                  <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mx-2 transform hover:scale-105 transition-all duration-300 h-full">
                    {/* Stars */}
                    <div className="flex justify-center mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-lg mx-1" />
                      ))}
                    </div>
                    
                    {/* Review Text */}
                    <blockquote className="text-base md:text-lg text-gray-700 leading-relaxed mb-6 italic min-h-[120px] flex items-center">
                      "{review.review}"
                    </blockquote>
                    
                    {/* Author Info */}
                    <div className="flex items-center justify-center">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-blue-200 mr-3 shadow-md"
                      />
                      <div className="text-left">
                        <h4 className="text-lg md:text-xl font-bold text-gray-800">{review.name}</h4>
                        <p className="text-blue-600 font-medium text-sm md:text-base">{review.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white hover:bg-blue-50 text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
          >
            <FaChevronLeft className="text-xl" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white hover:bg-blue-50 text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
          >
            <FaChevronRight className="text-xl" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-3">
          {Array.from({ length: getMaxSlides() }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-blue-600 w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-gray-200">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">2K+</div>
            <div className="text-gray-600 font-medium">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">50K+</div>
            <div className="text-gray-600 font-medium">Downloads</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">4.5</div>
            <div className="text-gray-600 font-medium">Average Rating</div> 
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600 font-medium">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientReviews;
