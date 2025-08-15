"use client";
import { useEffect, useState } from "react";

export function ContactForm() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [Newname, setNewName] = useState("");
  const [Mobile, setMobile] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/userToken");
      const data = await res.json();
      setIsLoggedIn(data.isAuthenticated);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/profileInfo");
      const data = await res.json();
      if (res.ok) {
        setEmailId(data.user.email);
        setMobile(data.user.mobile);
        setNewName(data.user.name);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: e.target.name.value,
          email: e.target.email.value,
          message: e.target.message.value,
          mobile: e.target.mobile.value,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        setLoading(false);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 to-red-100 px-4">
      <div className="w-full max-w-xl p-8 bg-white shadow-2xl rounded-3xl border border-gray-100">
        {isLoggedIn ? (
          submitted ? (
            <div className="text-center">
              <div className="text-green-500 text-4xl mb-4 animate-bounce">✅</div>
              <p className="text-green-600 font-semibold text-lg">
                Thank you! Your message has been sent.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center mb-1 text-gray-800">
                Contact Us
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                For queries: vectenoindia@gmail.com
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={Newname}
                    readOnly
                    required
                    className="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={emailId}
                    readOnly
                    required
                    className="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Mobile</label>
                  <input
                    type="text"
                    name="mobile"
                    value={Mobile}
                    readOnly
                    required
                    className="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Message</label>
                  <textarea
                    name="message"
                    rows="4"
                    required
                    placeholder="Type your message here..."
                    className="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white py-2 rounded-full font-medium transition ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 cursor-pointer'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Sending...
                    </div>
                  ) : (
                    '✉️ Submit Message'
                  )}
                </button>
              </form>
            </>
          )
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Login Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please log in to send us a message through the contact form
              </p>
              <button
                onClick={() => window.location.href = '/auth/signin'}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition cursor-pointer mb-6"
              >
                🔑 Login to Contact Us
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">
                Alternative Contact Information
              </h3>
              <div className="text-gray-700 space-y-3 text-center text-sm">
                <p>
                  <strong>📧 Email:</strong> vectenoindia@gmail.com
                </p>
                <p>
                  <strong>📍 Address:</strong> Gudamalani, Barmer (Rajasthan), India
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
