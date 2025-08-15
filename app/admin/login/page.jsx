"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('adminToken');
      
      if (adminToken) {
        try {
          // Verify token with server
          const response = await fetch('/api/admin/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });
          
          if (response.ok) {
            // Token is valid, redirect to intended destination or dashboard
            const redirectPath = localStorage.getItem('redirectAfterLogin');
            console.log('Already authenticated, redirectPath:', redirectPath);
            if (redirectPath && redirectPath !== '/admin/login') {
              localStorage.removeItem('redirectAfterLogin');
              console.log('Redirecting to stored path:', redirectPath);
              router.push(redirectPath);
            } else {
              console.log('No redirect path, going to dashboard');
              router.push('/admin/dashboard');
            }
            return;
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('adminToken');
          }
        } catch (error) {
          // Network error, clear token
          localStorage.removeItem('adminToken');
        }
      }
      
      // Not authenticated or token invalid, show login form
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requiresOTP) {
      // First step: Email and password
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await axios.post("/api/adminLogin", { email, password });
        
        if (response.data.message === "2FA Required") {
          // 2FA is enabled, show OTP input
          setRequiresOTP(true);
          // Send OTP email
          await sendLoginOTP();
        } else if (response.data.message === "Login Successful") {
          // Normal login without 2FA
          toast.success("Login successful! Redirecting...");
          localStorage.setItem('adminToken', response.data.token);
          redirectToDestination();
        } else {
          setError(response.data.error || "Login failed");
        }
      } catch (error) {
        setError(error.response?.data?.error || "An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Second step: OTP verification
      if (!otp) {
        setError("Please enter the verification code");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await axios.post("/api/admin/verify-login-otp", { email, otp });
        
        if (response.data.success) {
          toast.success("Login successful! Redirecting...");
          localStorage.setItem('adminToken', response.data.token);
          redirectToDestination();
        } else {
          setError(response.data.message || "Invalid verification code");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to verify code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendLoginOTP = async () => {
    try {
      const response = await axios.post("/api/admin/send-login-otp", { email });
      if (response.data.success) {
        setOtpSent(true);
        toast.success("Verification code sent to your email");
      } else {
        setError(response.data.message || "Failed to send verification code");
      }
    } catch (error) {
      setError("Failed to send verification code. Please try again.");
    }
  };

  const redirectToDestination = () => {
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    if (redirectPath && redirectPath !== '/admin/login') {
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    } else {
      router.push("/admin/dashboard");
    }
  };

  const handleBackToLogin = () => {
    setRequiresOTP(false);
    setOtpSent(false);
    setOtp("");
    setError("");
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    await sendLoginOTP();
    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <FaShieldAlt className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-blue-200">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
          {!requiresOTP ? (
            // Step 1: Email and Password
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100 flex items-center gap-2">
                  <FaEnvelope className="text-blue-300" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100 flex items-center gap-2">
                  <FaLock className="text-blue-300" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          ) : (
            // Step 2: OTP Verification
            <div className="space-y-6">
              {/* 2FA Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
                  <FaShieldAlt className="text-2xl text-blue-300" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Two-Factor Authentication</h2>
                <p className="text-blue-200 text-sm">
                  We've sent a 6-digit verification code to<br />
                  <span className="font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-100 flex items-center gap-2">
                    <FaLock className="text-blue-300" />
                    Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-center text-xl tracking-widest"
                      disabled={isLoading}
                      maxLength="6"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </form>

              {/* Resend OTP */}
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-blue-300 hover:text-white text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Resend Code
                </button>
                <br />
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-blue-300 hover:text-white text-sm transition-colors duration-200"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password Link - Only show in first step */}
          {!requiresOTP && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => router.push('/admin/forgot-password')}
                className="text-blue-300 hover:text-white text-sm font-medium transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Demo Credentials - Only show in first step */}
          {!requiresOTP && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-200 text-sm font-medium mb-2">Demo Credentials:</p>
              <div className="text-xs text-blue-300 space-y-1">
                <p><span className="font-medium">Email:</span> admin@gmail.com</p>
                <p><span className="font-medium">Password:</span> admin@123</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-blue-200 text-sm">
            Secure access to Vecteno Admin Dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
