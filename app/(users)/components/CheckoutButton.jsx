'use client';
import Script from 'next/script';

export default function CheckoutButton({ amount }) {
  const loadRazorpay = () => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: "INR",
      name: "Vecteno",
      description: "Premium Plan",
      image: "/logo.png",
      handler: async function (response) {
        console.log("Payment Success:", response);
        // Optionally call backend to verify & update DB
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
      },
      theme: {
        color: "#3399cc"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button onClick={loadRazorpay} className="bg-black text-white px-4 py-2 rounded">
        Pay ₹{amount}
      </button>
    </>
  );
}
