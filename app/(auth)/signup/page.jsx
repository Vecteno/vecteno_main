"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, UserPlus, User, Mail, Lock, Phone, Home, CheckCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/profileInfo");
        if (response.data.success) {
          // User is already logged in, redirect to dashboard
          router.push("/user/dashboard");
        }
      } catch (error) {
        // User is not logged in, allow access to signup page
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // Multi-provider email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|bing\.com|icloud\.com|me\.com|mac\.com)$/;
    return emailRegex.test(email);
  };

  // Handle email change with validation
  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    
    if (emailValue === "") {
      setEmailError("");
      setIsValidEmail(false);
    } else if (!validateEmail(emailValue)) {
      setEmailError("Please enter a valid email address (Gmail, Yahoo, Bing, or Apple)");
      setIsValidEmail(false);
    } else {
      setEmailError("");
      setIsValidEmail(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if email is valid before submitting
    if (!isValidEmail) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post("/api/auth/send-signup-otp", {
        name,
        email,
        password,
        mobile,
      });
      
      if (response.data.success) {
        // Redirect to OTP verification page with email parameter
        router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(response.data.message || "Failed to send verification email. Please try again.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left side - Brand Section */}
      <div className="w-1/2 relative hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 overflow-hidden">
        {/* Geometric Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white/20 rotate-45 rounded-3xl"></div>
          <div className="absolute bottom-32 right-24 w-24 h-24 border-2 border-white/15 rotate-12 rounded-2xl"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 border border-white/10 rotate-45 rounded-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-8 h-8 bg-white/10 rotate-45 rounded"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-12 max-w-md">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="text-blue-600 text-2xl font-bold">V</div>
            </div>
            <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              ← Back to Home
            </Link>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Join Vecteno Today! 🎉
          </h1>
          
          <p className="text-lg text-white/90 leading-relaxed">
            Create your free account and unlock endless creative possibilities with our platform.
          </p>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vecteno</h2>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Account!</h1>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter your name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors"
                />
              </div>

              {/* Email Input */}
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full px-4 py-3 border-b-2 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors ${
                    emailError 
                      ? 'border-red-400 focus:border-red-600' 
                      : isValidEmail 
                      ? 'border-green-400 focus:border-green-600' 
                      : 'border-gray-200 focus:border-blue-600'
                  }`}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
                {isValidEmail && (
                  <p className="text-green-500 text-sm mt-1">✓ Valid email address</p>
                )}
              </div>

              {/* Password Input */}
              <div className="mb-4 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Mobile Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Enter your mobile number"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors"
                />
              </div>

              {/* Error Message */}
              {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

              {/* Signup Button */}
              <button
                type="submit"
                disabled={!isValidEmail || isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/user/dashboard" })}
                className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3 mb-6 cursor-pointer"
              >
                <FcGoogle size={20} />
                Sign up with Google
              </button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-gray-500 text-sm">Already have an account? </span>
                <Link 
                  href="/login" 
                  className="text-blue-600 font-semibold text-sm hover:underline"
                >
                  Login here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
