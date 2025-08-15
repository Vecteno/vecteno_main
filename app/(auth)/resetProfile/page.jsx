"use client";
import Link from "next/link";
import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Shield } from "lucide-react";

const ResetPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState(0);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "/api/auth/send-reset-otp",
        { email }
      );
      
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        // Handle different error scenarios
        if (data.notRegistered) {
          toast.error(data.message);
          // Show signup option
          setTimeout(() => {
            if (confirm("Would you like to create a new account with this email?")) {
              router.push(`/signup?email=${encodeURIComponent(email)}`);
            }
          }, 2000);
        } else if (data.needsVerification) {
          toast.error(data.message);
          // Redirect to OTP verification
          setTimeout(() => {
            if (confirm("Would you like to complete your email verification first?")) {
              router.push(`/otp-verify?email=${encodeURIComponent(data.email)}`);
            }
          }, 2000);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((input) => input.value);
    const fullOtp = otpArray.join("");

    if (fullOtp.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP with server before proceeding
      const { data } = await axios.post(
        "/api/auth/verify-reset-otp",
        { email, otp: fullOtp }
      );
      
      if (data.success) {
        toast.success(data.message || "✅ OTP verified successfully!");
        setOtp(fullOtp);
        setIsOtpVerified(true);
        setIsOtpSubmitted(true);
      } else {
        toast.error(data.message || "❌ Invalid OTP. Please check and try again!");
        // Clear OTP inputs
        inputRefs.current.forEach(input => {
          if (input) input.value = "";
        });
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ Failed to verify OTP. Please try again!");
      // Clear OTP inputs on error
      inputRefs.current.forEach(input => {
        if (input) input.value = "";
      });
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    
    // Double check that OTP was verified
    if (!isOtpVerified) {
      toast.error("Please verify your OTP first.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "/api/auth/reset-password",
        { email, otp, newPassword }
      );

      if (data.success) {
        toast.success(data.message || "Password updated successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to update password. Please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
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
            Reset Your Password! 🔐
          </h1>
          
          <p className="text-lg text-white/90 leading-relaxed">
            Secure your account by creating a new password. We'll guide you through the process step by step.
          </p>
        </div>
      </div>

      {/* Right side - Reset Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vecteno</h2>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Reset Password</h1>
            </div>

            {/* Email Form */}
            {!isEmailSent && (
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-gray-600 text-sm">
                    Enter your registered email address and we'll send you a verification code
                  </p>
                </div>

                <form onSubmit={onSubmitEmail}>
                  <div className="mb-6">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-blue-600 font-semibold text-sm hover:underline flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}

            {/* OTP Form */}
            {!isOtpSubmitted && isEmailSent && (
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Verify Code
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We've sent a 6-digit verification code to
                  </p>
                  <p className="text-blue-600 font-semibold text-sm break-all">
                    {email}
                  </p>
                </div>

                <form onSubmit={onSubmitOTP}>
                  <div className="mb-6">
                    <label className="font-semibold block mb-3 text-center">
                      Enter Verification Code
                    </label>
                    <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
                      {Array(6)
                        .fill(0)
                        .map((_, index) => (
                          <input
                            type="text"
                            maxLength="1"
                            key={index}
                            required
                            className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                            ref={(el) => (inputRefs.current[index] = el)}
                            onInput={(e) => handleInput(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          />
                        ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-blue-600 font-semibold text-sm hover:underline flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}

            {/* New Password Form */}
            {isOtpSubmitted && isEmailSent && (
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    New Password
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={onSubmitNewPassword}>
                  <div className="mb-6 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-blue-600 font-semibold text-sm hover:underline flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
