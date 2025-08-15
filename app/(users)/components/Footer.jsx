"use client";

import Link from "next/link";
import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaHeart, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  const resources = [
    { name: "Products", href: "/products" },
    { name: "Categories", href: "/category" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blogs", href: "/blogs" },
    { name: "Trending", href: "/trending" },
    { name: "Top Rated", href: "/top-rated" }
  ];

  const legal = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "License Agreement", href: "/license" },
    { name: "Contact Us", href: "/contact" },
    { name: "About Us", href: "/about" },
    { name: "Support", href: "/support" }
  ];

  const socialLinks = [
    { icon: FaFacebook, href: "#", label: "Facebook" },
    { icon: FaTwitter, href: "#", label: "Twitter" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn" },
    { icon: FaYoutube, href: "#", label: "YouTube" }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Vecteno
              </h1>
              <p className="text-gray-300 mt-2 text-sm">
                Your ultimate destination for premium graphic resources
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-gray-300">
                <FaMapMarkerAlt className="text-blue-400 flex-shrink-0" />
                <span className="text-sm">Gudamalani, Barmer (Rajasthan)</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <FaEnvelope className="text-blue-400 flex-shrink-0" />
                <a href="mailto:info@vecteno.com" className="text-sm hover:text-blue-400 transition-colors">
                  info@vecteno.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <FaPhone className="text-blue-400 flex-shrink-0" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              {resources.map((resource, index) => (
                <li key={index}>
                  <Link
                    href={resource.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm block py-1"
                  >
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              {legal.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm block py-1"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Newsletter</h3>
            <p className="text-gray-300 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and exclusive offers.
            </p>
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                Powered By – God of Graphics | Copyright © 2025 Vecteno. All rights reserved.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm flex items-center justify-center md:justify-end">
                Developed with <FaHeart className="text-red-500 mx-1" /> by 
                <a 
                  href="#" 
                  className="text-blue-400 hover:text-blue-300 transition-colors ml-1"
                >
                  Saarthi Digital Media and Marketing
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-50"
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
