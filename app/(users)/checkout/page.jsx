"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("planId");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);
  
  const [plan, setPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState("");

  useEffect(() => {
    if (!planId) {
      toast.error("Plan not selected");
      router.push("/pricing");
      return;
    }
    
    fetchPlanAndUser();
    fetchRazorpayKey();
  }, [planId]);

  const fetchPlanAndUser = async () => {
    try {
      // Fetch plan details
      const planRes = await fetch(`/api/plans/${planId}`);
      const planData = await planRes.json();
      
      if (!planRes.ok) {
        throw new Error(planData.message || "Failed to fetch plan");
      }

      // Fetch user details
      const userRes = await fetch("/api/profileInfo");
      const userData = await userRes.json();
      
      if (!userRes.ok) {
        throw new Error("Please login to continue");
      }

      setPlan(planData.plan);
      setUser(userData.user);
      setFinalPrice(planData.plan.discountedPrice || planData.plan.originalPrice);
    } catch (error) {
      toast.error(error.message);
      router.push("/pricing");
    } finally {
      setLoading(false);
    }
  };

  const fetchRazorpayKey = async () => {
    try {
      const res = await fetch("/api/razorpay-config");
      const data = await res.json();
      if (res.ok) {
        setRazorpayKey(data.keyId);
      }
    } catch (error) {
      console.error("Failed to load Razorpay key:", error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: couponCode.trim().toUpperCase(),
          userId: user._id 
        }),
      });

      const data = await res.json();

      if (data.success) {
        const originalPrice = plan.discountedPrice || plan.originalPrice;
        const discountAmount = (originalPrice * data.discountPercent) / 100;
        const newPrice = Math.max(0, originalPrice - discountAmount);
        
        setAppliedCoupon(data.coupon);
        setFinalPrice(newPrice);
        toast.success(`Coupon applied! ${data.discountPercent}% discount`);
      } else {
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast.error("Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setFinalPrice(plan.discountedPrice || plan.originalPrice);
    toast.info("Coupon removed");
  };

  const handlePayment = async () => {
    if (finalPrice === 0) {
      // Activate plan directly for 100% discount
      activatePlanDirectly();
      return;
    }

    if (!razorpayKey) {
      toast.error("Payment system not configured. Please contact admin.");
      return;
    }

    setPaymentLoading(true);
    try {
      // Create order
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalPrice }),
      });

      const orderData = await orderRes.json();
      
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Vecteno",
        description: `Payment for ${plan.name}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          verifyPayment(response, orderData.order);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#1F2937",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const verifyPayment = async (response, order) => {
    try {
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...response,
          planId: plan._id, // ✅ CRITICAL: Added planId
          userId: user._id,
          amount: order.amount,
          couponCode: appliedCoupon?.code,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        toast.success("Payment successful! Plan activated 🎉");
        setTimeout(() => {
          router.push("/user?tab=plans");
        }, 2000);
      } else {
        toast.error(verifyData.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed");
    }
  };

  const activatePlanDirectly = async () => {
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/activate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan._id,
          userId: user._id,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success("Plan activated successfully! 🎉");
        setTimeout(() => {
          router.push("/user?tab=plans");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to activate plan");
      }
    } catch (error) {
      console.error("Plan activation error:", error);
      toast.error("Failed to activate plan");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500">Plan not found</p>
      </div>
    );
  }

  const originalPrice = plan.discountedPrice || plan.originalPrice;
  const savings = originalPrice - finalPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Checkout</h1>
        
        {/* Plan Details */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900">{plan.name}</h2>
          <p className="text-sm text-blue-700 mt-1">{plan.description}</p>
          
          <div className="mt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Original Price:</span>
              <span className="text-gray-900">₹{originalPrice}</span>
            </div>
            
            {appliedCoupon && (
              <div className="flex justify-between items-center text-green-600">
                <span>Discount ({appliedCoupon.discountPercent}%):</span>
                <span>-₹{savings}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2">
              <span>Final Price:</span>
              <span className={finalPrice === 0 ? "text-green-600" : "text-gray-900"}>
                {finalPrice === 0 ? "FREE" : `₹${finalPrice}`}
              </span>
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coupon Code
          </label>
          
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "..." : "Apply"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
              <div>
                <span className="text-green-800 font-medium">{appliedCoupon.code}</span>
                <span className="text-green-600 text-sm ml-2">
                  ({appliedCoupon.discountPercent}% off)
                </span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={paymentLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {paymentLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            finalPrice === 0 ? "Activate Plan (FREE)" : `Pay ₹${finalPrice}`
          )}
        </button>

        {/* Back to pricing link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/pricing")}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Pricing
          </button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { toast } from "react-hot-toast";

// export default function CheckoutPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const planId = searchParams.get("planId");

//   // Load Razorpay script
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     document.body.appendChild(script);
//   }, []);
  
//   const [plan, setPlan] = useState(null);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [couponCode, setCouponCode] = useState("");
//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [finalPrice, setFinalPrice] = useState(0);
//   const [paymentLoading, setPaymentLoading] = useState(false);
//   const [razorpayKey, setRazorpayKey] = useState("");

//   useEffect(() => {
//     if (!planId) {
//       toast.error("Plan not selected");
//       router.push("/pricing");
//       return;
//     }
    
//     fetchPlanAndUser();
//     fetchRazorpayKey();
//   }, [planId]);

//   const fetchPlanAndUser = async () => {
//     try {
//       // Fetch plan details
//       const planRes = await fetch(`/api/plans/${planId}`);
//       const planData = await planRes.json();
      
//       if (!planRes.ok) {
//         throw new Error(planData.message || "Failed to fetch plan");
//       }

//       // Fetch user details
//       const userRes = await fetch("/api/profileInfo");
//       const userData = await userRes.json();
      
//       if (!userRes.ok) {
//         throw new Error("Please login to continue");
//       }

//       setPlan(planData.plan);
//       setUser(userData.user);
//       setFinalPrice(planData.plan.discountedPrice || planData.plan.originalPrice);
//     } catch (error) {
//       toast.error(error.message);
//       router.push("/pricing");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchRazorpayKey = async () => {
//     try {
//       const res = await fetch("/api/razorpay-config");
//       const data = await res.json();
//       if (res.ok) {
//         setRazorpayKey(data.keyId);
//       }
//     } catch (error) {
//       console.error("Failed to load Razorpay key:", error);
//     }
//   };

//   const handleApplyCoupon = async () => {
//     if (!couponCode.trim()) {
//       toast.error("Please enter a coupon code");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/coupons/validate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           code: couponCode.trim().toUpperCase(),
//           userId: user._id 
//         }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         const originalPrice = plan.discountedPrice || plan.originalPrice;
//         const discountAmount = (originalPrice * data.discountPercent) / 100;
//         const newPrice = Math.max(0, originalPrice - discountAmount);
        
//         setAppliedCoupon(data.coupon);
//         setFinalPrice(newPrice);
//         toast.success(`Coupon applied! ${data.discountPercent}% discount`);
//       } else {
//         toast.error(data.message || "Invalid coupon code");
//       }
//     } catch (error) {
//       console.error("Coupon validation error:", error);
//       toast.error("Failed to validate coupon");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveCoupon = () => {
//     setAppliedCoupon(null);
//     setCouponCode("");
//     setFinalPrice(plan.discountedPrice || plan.originalPrice);
//     toast.info("Coupon removed");
//   };

//   const handlePayment = async () => {
//     if (finalPrice === 0) {
//       // Activate plan directly for 100% discount
//       activatePlanDirectly();
//       return;
//     }

//     if (!razorpayKey) {
//       toast.error("Payment system not configured. Please contact admin.");
//       return;
//     }

//     setPaymentLoading(true);
//     try {
//       // Create order
//       const orderRes = await fetch("/api/payment/order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ amount: finalPrice }),
//       });

//       const orderData = await orderRes.json();
      
//       if (!orderRes.ok) {
//         throw new Error(orderData.error || "Failed to create payment order");
//       }

//       // Initialize Razorpay
//       const options = {
//         key: razorpayKey,
//         amount: orderData.order.amount,
//         currency: "INR",
//         name: "Vecteno",
//         description: `Payment for ${plan.name}`,
//         order_id: orderData.order.id,
//         handler: async function (response) {
//           verifyPayment(response, orderData.order);
//         },
//         prefill: {
//           name: user.name,
//           email: user.email,
//         },
//         theme: {
//           color: "#1F2937",
//         },
//       };

//       const razor = new window.Razorpay(options);
//       razor.open();
//     } catch (error) {
//       console.error("Payment Error:", error);
//       toast.error(error.message || "Failed to initiate payment");
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   const verifyPayment = async (response, order) => {
//     try {
//       const verifyRes = await fetch("/api/payment/verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...response,
//           planId: plan._id,
//           userId: user._id,
//           amount: order.amount,
//           couponCode: appliedCoupon?.code,
//         }),
//       });

//       if (verifyRes.ok) {
//         toast.success("Payment successful! Plan activated 🎉");
//         setTimeout(() => {
//           router.push("/user?tab=plans");
//         }, 2000);
//       } else {
//         toast.error("Payment verification failed");
//       }
//     } catch (error) {
//       console.error("Payment verification error:", error);
//       toast.error("Payment verification failed");
//     }
//   };

//   const activatePlanDirectly = async () => {
//     setPaymentLoading(true);
//     try {
//       const res = await fetch("/api/activate-plan", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           planId: plan._id,
//           userId: user._id,
//           couponCode: appliedCoupon?.code,
//         }),
//       });

//       const data = await res.json();
      
//       if (data.success) {
//         toast.success("Plan activated successfully! 🎉");
//         setTimeout(() => {
//           router.push("/user?tab=plans");
//         }, 2000);
//       } else {
//         toast.error(data.message || "Failed to activate plan");
//       }
//     } catch (error) {
//       console.error("Plan activation error:", error);
//       toast.error("Failed to activate plan");
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex justify-center items-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!plan) {
//     return (
//       <div className="min-h-screen flex justify-center items-center">
//         <p className="text-red-500">Plan not found</p>
//       </div>
//     );
//   }

//   const originalPrice = plan.discountedPrice || plan.originalPrice;
//   const savings = originalPrice - finalPrice;

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
//         <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Checkout</h1>
        
//         {/* Plan Details */}
//         <div className="mb-6 p-4 bg-blue-50 rounded-lg">
//           <h2 className="text-lg font-semibold text-blue-900">{plan.name}</h2>
//           <p className="text-sm text-blue-700 mt-1">{plan.description}</p>
          
//           <div className="mt-3">
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Original Price:</span>
//               <span className="text-gray-900">₹{originalPrice}</span>
//             </div>
            
//             {appliedCoupon && (
//               <div className="flex justify-between items-center text-green-600">
//                 <span>Discount ({appliedCoupon.discountPercent}%):</span>
//                 <span>-₹{savings}</span>
//               </div>
//             )}
            
//             <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2">
//               <span>Final Price:</span>
//               <span className={finalPrice === 0 ? "text-green-600" : "text-gray-900"}>
//                 {finalPrice === 0 ? "FREE" : `₹${finalPrice}`}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Coupon Section */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Coupon Code
//           </label>
          
//           {!appliedCoupon ? (
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={couponCode}
//                 onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
//                 placeholder="Enter coupon code"
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 disabled={loading}
//               />
//               <button
//                 onClick={handleApplyCoupon}
//                 disabled={loading || !couponCode.trim()}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? "..." : "Apply"}
//               </button>
//             </div>
//           ) : (
//             <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
//               <div>
//                 <span className="text-green-800 font-medium">{appliedCoupon.code}</span>
//                 <span className="text-green-600 text-sm ml-2">
//                   ({appliedCoupon.discountPercent}% off)
//                 </span>
//               </div>
//               <button
//                 onClick={handleRemoveCoupon}
//                 className="text-red-600 hover:text-red-800 text-sm"
//               >
//                 Remove
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Payment Button */}
//         <button
//           onClick={handlePayment}
//           disabled={paymentLoading}
//           className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//         >
//           {paymentLoading ? (
//             <div className="flex items-center justify-center">
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//               Processing...
//             </div>
//           ) : (
//             finalPrice === 0 ? "Activate Plan (FREE)" : `Pay ₹${finalPrice}`
//           )}
//         </button>

//         {/* Back to pricing link */}
//         <div className="mt-4 text-center">
//           <button
//             onClick={() => router.push("/pricing")}
//             className="text-blue-600 hover:text-blue-800 text-sm"
//           >
//             ← Back to Pricing
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
