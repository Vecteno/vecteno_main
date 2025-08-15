"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function Checkout({ plan }) {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState(plan.price);

  const handleApplyCoupon = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });

      const { success, discountPercent } = await res.json();

      if (success) {
        const newPrice = plan.price - (plan.price * discountPercent) / 100;
        setDiscountedPrice(newPrice);
        toast.success(`Coupon applied! New price: ₹${newPrice}`);
      } else {
        toast.error("Invalid coupon code");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast.error("Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (discountedPrice === 0) {
      // Activate plan directly without payment for 100% discount
      toast.success("Plan activated successfully!");
      return;
    }

    // Proceed with Razorpay payment for others
    toast.info("Proceeding to payment...");
  };

  return (
    <div className="checkout-page">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p>Plan: {plan.name}</p>
      <p>Price: ₹{discountedPrice}</p>

      <input
        type="text"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        placeholder="Enter coupon code"
        className="coupon-input"
      />
      <button onClick={handleApplyCoupon} disabled={loading} className="apply-coupon-btn">
        Apply Coupon
      </button>

      <button onClick={handlePayment} className="pay-btn">
        {discountedPrice === 0 ? "Activate Plan" : "Pay Now"}
      </button>
    </div>
  );
}
