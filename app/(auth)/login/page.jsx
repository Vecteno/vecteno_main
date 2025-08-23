"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  LogIn,
  CheckCircle,
  Mail,
  Lock,
  Home,
} from "lucide-react"; // Lucide icons
import { FcGoogle } from "react-icons/fc"; // Google icon

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if user is already logged in and handle verification success
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/profileInfo");
        if (response.data.success) {
          // User is already logged in, redirect to dashboard
          router.push("/user/dashboard");
        }
      } catch (error) {
        // User is not logged in, allow access to login page
        setIsCheckingAuth(false);
      }
    };

    // Check for verification success message
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setSuccess("Email verified successfully! You can now login.");
    }

    checkAuth();
  }, [router, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/login", { email, password });
      if (response.data.message === "Login Successful") {
        router.push("/user/dashboard");
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.needsVerification && errorData?.email) {
        // Redirect to OTP verification page
        router.push(`/otp-verify?email=${encodeURIComponent(errorData.email)}`);
      } else {
        setError(errorData?.error || "Login failed. Please try again.");
      }
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
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              ← Back to Home
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-4">Hello Vecteno! 👋</h1>

          <p className="text-lg text-white/90 leading-relaxed">
            Access your creative dashboard and manage your digital assets with
            ease. Get productive through our powerful tools!
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vecteno</h2>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome Back!
              </h1>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors"
                />
              </div>

              {/* Password Input */}
              <div className="mb-6 relative">
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

              {/* Success/Error Messages */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </div>
                ) : (
                  "Login Now"
                )}
              </button>

              {/* Google Sign In */}
              <button
                type="button"
                disabled={isLoading}
                className="border border-gray-300 p-2 w-full rounded-full flex items-center justify-center gap-2 mb-6 hover:bg-gray-100 transition"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/user/dashboard`,
                  })
                }
              >
                <FcGoogle size={20} />
                Login with Google
              </button>

              {/* Forgot Password */}
              <div className="text-center mb-4">
                <span className="text-gray-500 text-sm">Forget password </span>
                <Link
                  href="/resetProfile"
                  className="text-gray-900 font-semibold text-sm hover:underline"
                >
                  Click here
                </Link>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-gray-500 text-sm">
                  Don't have an account?{" "}
                </span>
                <Link
                  href="/signup"
                  className="text-blue-600 font-semibold text-sm hover:underline"
                >
                  Create a new account now
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
