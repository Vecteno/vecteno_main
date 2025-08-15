"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function PricingClient({ plans, currentPlan }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [razorpayKey, setRazorpayKey] = useState("");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch user info
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
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
        } else {
          // User not authenticated - reset user state
          setUser(null);
          // Don't log error for "Not Authenticated" or "User not found" - these are normal
          if (data.error !== "Not Authenticated" && data.error !== "User not found") {
            console.error("Failed to load user:", data.error);
          }
        }
      } catch (err) {
        console.error("User fetch error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    const fetchRazorpayKey = async () => {
      const res = await fetch("/api/razorpay-config");
      const data = await res.json();
      if (res.ok) {
        setRazorpayKey(data.keyId);
      } else {
        console.error("Failed to load Razorpay key:", data.error);
      }
    };
    fetchRazorpayKey();
  }, []);

  const handlePayment = async (plan) => {
    if (!user) {
      toast.error("Please log in to purchase a plan.");
      return;
    }

    const currentLevel = currentPlan?.level || 0;
    if (plan.level <= currentLevel) {
      toast("You already have this plan or a higher one.", { icon: "⚠️" });
      return;
    }

    // Redirect to checkout page
    window.location.href = `/checkout?planId=${plan._id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-700 text-lg">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 text-gray-900">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 text-lg">
            Select the perfect plan for your creative needs
          </p>
        </div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            // Only check for plan restrictions if user is logged in
            const isCurrentPlan = user && currentPlan && plan.level === currentPlan.level;
            const isLowerPlan = user && currentPlan && plan.level < currentPlan.level;
            const isFreeplan = plan.originalPrice === 0;
            // Plan is only disabled if user is logged in AND has current/higher plan, OR if it's free plan
            const isDisabled = (user && (isCurrentPlan || isLowerPlan)) || isFreeplan;

            return (
              <div
                key={plan._id}
                onClick={() => !isDisabled && handlePayment(plan)}
                className={`bg-blue-600 rounded-lg p-8 text-white shadow-lg relative cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  isDisabled ? 'cursor-not-allowed opacity-75' : 'hover:bg-blue-700'
                }`}
              >
                {/* Popular Badge */}
                {idx === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </div>
                )}

                {/* Title */}
                <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>

                {/* Price */}
                <div className="mb-2">
                  {plan.discountedPrice ? (
                    <div className="mb-1">
                      <div className="text-lg line-through opacity-70">₹{plan.originalPrice}</div>
                      <div className="text-4xl font-bold">₹{plan.discountedPrice}</div>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold mb-1">₹{plan.originalPrice}</div>
                  )}
                  <div className="text-sm opacity-90">{plan.description || "Billed monthly"}</div>
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                  <div
                    className={`w-full py-3 rounded-lg font-medium transition-colors text-center ${
                      isDisabled
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-white text-blue-600 hover:bg-gray-100"
                    }`}
                  >
                    {isCurrentPlan 
                      ? "Current Plan" 
                      : isFreeplan 
                        ? "Free Plan" 
                        : !user 
                          ? `GET ${plan.name.toUpperCase()}` 
                          : `GET ${plan.name.toUpperCase()}`
                    }
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className={`text-lg ${feature.included ? 'text-green-400' : 'text-red-400'}`}>
                        {feature.included ? '✅' : '❌'}
                      </span>
                      <span className={`opacity-90 ${!feature.included ? 'line-through' : ''}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Footer Link */}
                <div className="mt-8 pt-6 border-t border-blue-500">
                  <div className="text-white text-sm underline hover:opacity-80 text-center">
                    COMPARE ALL FEATURES
                  </div>
                </div>

                {/* Click Indicator */}
                {!isDisabled && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
