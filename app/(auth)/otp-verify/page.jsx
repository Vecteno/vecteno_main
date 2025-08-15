"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, Clock, RefreshCw, Shield, CheckCircle } from "lucide-react";

const OtpVerify = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds
  const [canResend, setCanResend] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // If no email in params, redirect to signup
      router.push("/signup");
    }
  }, [searchParams, router]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/verify-signup-otp", {
        email,
        otp: otpString,
      });

      if (response.data.success) {
        toast.success(response.data.message || "✅ Email verified successfully!");
        if (response.data.autoLogin) {
          // User is automatically logged in, redirect to dashboard
          setTimeout(() => {
            router.push("/user/dashboard");
          }, 1500);
        } else {
          // Fallback to login page
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 1500);
        }
      } else {
        toast.error(response.data.message || "❌ Invalid verification code. Please try again.");
        // Clear OTP inputs on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ Verification failed. Please try again.");
      // Clear OTP inputs on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      const response = await axios.post("/api/auth/resend-signup-otp", {
        email,
      });

      if (response.data.success) {
        toast.success("📧 New verification code sent to your email!");
        setTimeLeft(30); // Reset timer to 30 seconds
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(response.data.message || "Failed to resend verification code");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend verification code");
    } finally {
      setIsResending(false);
    }
  };

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
            Almost There! 🎯
          </h1>
          
          <p className="text-lg text-white/90 leading-relaxed">
            We've sent a verification code to your email. Enter it below to complete your account setup and start creating!
          </p>
        </div>
      </div>

      {/* Right side - OTP Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vecteno</h2>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Verify Email</h1>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-gray-600 text-sm mb-2">
                We've sent a 6-digit verification code to
              </p>
              <p className="text-blue-600 font-semibold text-sm break-all">
                {email}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              {/* OTP Input */}
              <div className="mb-6">
                <label className="font-semibold block mb-3 text-center text-gray-700">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      maxLength={1}
                    />
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className={`w-4 h-4 ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-500'}`} />
                  <span className={timeLeft <= 10 ? 'text-red-500 font-medium' : 'text-gray-600'}>
                    {timeLeft > 0 ? (
                      <>Resend available in {formatTime(timeLeft)}</>
                    ) : (
                      <span className="text-green-500 font-medium">Ready to resend!</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify Email
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center mb-6">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isResending}
                  className={`text-sm font-medium transition-colors ${
                    canResend && !isResending
                      ? "text-blue-600 hover:text-blue-700 hover:underline"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isResending ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending new code...
                    </span>
                  ) : canResend ? (
                    "Didn't receive code? Resend"
                  ) : (
                    `Resend available in ${formatTime(timeLeft)}`
                  )}
                </button>
              </div>

              {/* Back to Signup */}
              <div className="text-center">
                <Link
                  href="/signup"
                  className="text-blue-600 font-semibold text-sm hover:underline flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Signup
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerify;
