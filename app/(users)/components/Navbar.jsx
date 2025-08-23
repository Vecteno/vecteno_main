"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaUser,
  FaCrown,
  FaBars,
  FaTimes,
  FaSpinner,
  FaVectorSquare,
} from "react-icons/fa";
import DefaultUserIcon from "@/app/components/DefaultUserIcon";
import { IoIosArrowDown } from "react-icons/io";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userImage, setUserImage] = useState("");
  const [userName, setUserName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [categories, setCategories] = useState([]);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const toggleMobileDropdown = () => setMobileDropdownOpen((prev) => !prev);

  // Function to check if a link is active
  const isActiveLink = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowSearchDropdown(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.images || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const handleSearchResultClick = (result) => {
    router.push(`/${result.category.replace(/\s+/g, "-")}/${result.slug}`);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  // Sticky navbar scroll detection - only on desktop
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const isDesktop = window.innerWidth >= 768; // Only sticky on desktop (md breakpoint)
      setIsSticky(scrollTop > 50 && isDesktop);
    };

    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      if (!isDesktop) {
        setIsSticky(false); // Remove sticky on mobile
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function to fetch user data
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/profileInfo?t=" + Date.now(), {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const data = await res.json();

      if (res.ok) {
        setIsLoggedIn(true);
        setUserImage(data.user.profileImage || null);
        setUserName(data.user.name);
        setIsPremium(data.user.isPremium);
        console.log(
          "User premium status:",
          data.user.isPremium,
          "Expires at:",
          data.user.premiumExpiresAt
        );
      } else {
        setIsLoggedIn(false);
        setIsPremium(false);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setIsLoggedIn(false);
      setIsPremium(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchUser();
    };

    // Listen for custom profile update event
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  // Fetch categories for navbar dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success && data.categories) {
          const categoryNames = data.categories.map((cat) => cat.label);
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error("Error fetching navbar categories:", error);
        // Fallback to default categories
        setCategories([
          "Templates",
          "CDR Files",
          "PSD Files",
          "Invitations",
          "Banner",
          "Social Media",
          "Thumbnails",
        ]);
      }
    };
    fetchCategories();
  }, []);
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });

    window.location.href = "/login"; // Or wherever you want them to land
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav
        className={`bg-white shadow-lg px-6 py-5 w-auto transition-all duration-300 border-b border-gray-100 ${
          isSticky
            ? "md:fixed md:top-0 md:left-0 md:right-0 md:z-50 md:bg-white/95 md:backdrop-blur-md md:shadow-xl md:border-b md:border-gray-200"
            : "relative"
        }`}
      >
        <div className="flex items-center justify-between h-12">
          {/* Logo + Categories */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center group">
              <img
                src="/vectenoLogo.webp"
                alt="Vecteno"
                className="text-2xl font-semibold h-20 w-55 object-contain group-hover:opacity-90 transition-opacity duration-200"
              />
            </Link>

            <div className="hidden md:block relative group">
              <button className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200">
                <FaBars className="mr-2 text-sm" />
                <span className="font-semibold">Categories</span>
                <IoIosArrowDown className="ml-2 text-sm" />
              </button>

              <ul
                className="absolute left-0 mt-3 bg-white border border-gray-200 rounded-xl shadow-xl 
    opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 
    z-50 backdrop-blur-sm p-2 w-40 max-h-[350px] overflow-y-auto"
              >
                {categories.map((cat, idx) => (
                  <li key={idx}>
                    <Link
                      href={`/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                      className="block px-4 py-2 hover:bg-blue-700 hover:text-white text-sm font-medium transition-colors duration-200 rounded-md whitespace-nowrap"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Search */}
          <div
            className="hidden md:flex flex-1 mx-8 max-w-3xl relative"
            ref={searchRef}
          >
            <form
              onSubmit={handleSearch}
              className="flex items-center w-full border-2 border-gray-200 hover:border-blue-300 focus-within:border-blue-500 rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 bg-gray-50 hover:bg-white"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 outline-none text-sm bg-transparent font-medium placeholder-gray-500"
              />
              <button
                type="submit"
                className="p-1 hover:bg-blue-100 rounded-full transition-colors duration-200"
              >
                {isSearching ? (
                  <FaSpinner className="text-blue-500 animate-spin text-lg" />
                ) : (
                  <FaSearch className="text-blue-500 hover:text-blue-600 text-lg" />
                )}
              </button>
            </form>

            {/* Search Results Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <FaSpinner className="animate-spin mx-auto mb-2" />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    {searchResults.slice(0, 8).map((result) => (
                      <div
                        key={result._id}
                        onClick={() => handleSearchResultClick(result)}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                          {result.imageUrl && (
                            <img
                              src={result.imageUrl}
                              alt={result.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {result.category}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    ))}
                    {searchResults.length > 8 && (
                      <div className="p-3 text-center border-t border-gray-100">
                        <button
                          onClick={handleSearch}
                          className="text-blue-600 text-sm hover:text-blue-800"
                        >
                          View all {searchResults.length} results
                        </button>
                      </div>
                    )}
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8 text-sm font-semibold">
              <li
                className={`pb-2 transition-all duration-200 ${
                  isActiveLink("/")
                    ? "text-blue-600 border-b-3 border-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <Link href="/">Home</Link>
              </li>
              <li
                className={`pb-2 transition-all duration-200 ${
                  isActiveLink("/products")
                    ? "text-blue-600 border-b-3 border-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <Link href="/products">Products</Link>
              </li>
              <li
                className={`pb-2 transition-all duration-200 ${
                  isActiveLink("/pricing")
                    ? "text-blue-600 border-b-3 border-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <Link href="/pricing">Pricing</Link>
              </li>
              <li
                className={`pb-2 transition-all duration-200 ${
                  isActiveLink("/blogs")
                    ? "text-blue-600 border-b-3 border-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <Link href="/blogs">Blogs</Link>
              </li>
              <li
                className={`pb-2 transition-all duration-200 ${
                  isActiveLink("/contact")
                    ? "text-blue-600 border-b-3 border-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <Link href="/contact">Contact</Link>
              </li>
            </ul>

            {/* Profile */}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <div
                  className="text-black cursor-pointer rounded-full p-1 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-300 transition-all duration-200"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {userImage ? (
                    <img
                      src={userImage}
                      alt="Profile"
                      className="w-11 h-11 rounded-full hover:ring-2 hover:ring-blue-300 transition-all duration-200"
                    />
                  ) : (
                    <DefaultUserIcon
                      size={44}
                      className="hover:ring-2 hover:ring-blue-300 transition-all duration-200"
                    />
                  )}
                </div>
                {dropdownOpen && (
                  <ul className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-xl shadow-xl text-sm z-50 backdrop-blur-sm">
                    <p className="px-4 py-3 font-semibold border-b border-gray-200 bg-gray-50 text-gray-800">
                      {userName}
                    </p>
                    <li>
                      <Link
                        href="/user/dashboard"
                        className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors duration-200"
                      >
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="p-2 rounded-full hover:bg-blue-100 transition-colors duration-200"
              >
                <FaUser className="text-2xl text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200" />
              </Link>
            )}

            {/* Subscription Status (Free or Premium) */}
            <Link
              href="/pricing"
              className={`flex items-center transition-all duration-200 ${
                isPremium
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black shadow-md"
                  : "bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700"
              } px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md`}
            >
              <FaCrown className="mr-2" />
              {isPremium ? "Premium Tier" : "Free Tier"}
            </Link>
          </div>

          {/* Hamburger for mobile */}
          <button
            className="md:hidden text-2xl text-gray-700"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div
          className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg transform transition-transform duration-300 z-50 md:hidden ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Close Button */}
          <div className="flex justify-end p-4 border-b">
            <button onClick={toggleMobileMenu}>
              <FaTimes className="text-2xl text-gray-700 hover:text-red-600 transition" />
            </button>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
            {/* Categories */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                Explore
              </h2>
              <button
                onClick={toggleMobileDropdown}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded w-full justify-between hover:bg-blue-600 transition"
              >
                <span className="flex items-center gap-2">
                  <FaBars />
                  Categories
                </span>
                <IoIosArrowDown />
              </button>
              {mobileDropdownOpen && (
                <ul className="bg-white border mt-2 rounded shadow-md overflow-hidden">
                  {categories.map((cat, idx) => (
                    <li key={idx}>
                      <Link
                        href={`/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <form
                onSubmit={handleSearch}
                className="flex items-center border rounded-full px-4 py-2 shadow-sm"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search designs..."
                  className="flex-1 outline-none text-sm"
                />
                <button type="submit">
                  {isSearching ? (
                    <FaSpinner className="text-gray-500 animate-spin" />
                  ) : (
                    <FaSearch className="text-gray-500" />
                  )}
                </button>
              </form>

              {/* Mobile Search Results */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  {searchResults.slice(0, 5).map((result) => (
                    <div
                      key={result._id}
                      onClick={() => {
                        handleSearchResultClick(result);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                        {result.imageUrl && (
                          <img
                            src={result.imageUrl}
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {result.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                Quick Links
              </h2>
              <ul className="space-y-2 text-sm font-medium">
                {[
                  { label: "Home", href: "/" },
                  { label: "Products", href: "/products" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "Blogs", href: "/blogs" },
                  { label: "Contact", href: "/contact" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block px-2 py-2 rounded transition ${
                        isActiveLink(link.href)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-800 hover:bg-gray-100"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* User/Profile Section */}
            <div
              className="pt-4 border-t"
              onClick={() => setMobileMenuOpen(false)}
            >
              <h2 className="text-sm font-semibold text-black mb-2">Account</h2>
              <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                  <div className="relative">
                    <div
                      className="text-black cursor-pointer rounded-full p-2 hover:bg-gray-400 border"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <div className="flex flex-row gap-5 w-50 items-center">
                        {userImage ? (
                          <img
                            src={userImage}
                            alt="Profile"
                            className="w-10 h-10 rounded-full cursor-pointer border hover:ring-2"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                          />
                        ) : (
                          <div onClick={() => setDropdownOpen(!dropdownOpen)}>
                            <DefaultUserIcon
                              size={40}
                              className="cursor-pointer hover:ring-2"
                            />
                          </div>
                        )}
                        <div>
                          <Link
                            href="/pricing"
                            className={`flex items-center ${
                              isPremium
                                ? "bg-yellow-400 text-black"
                                : "bg-gray-200 text-gray-700"
                            } px-3 py-1 rounded font-semibold`}
                          >
                            <FaCrown className="mr-2" />
                            {isPremium ? "Premium Tier" : "Free Tier"}
                          </Link>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/user/dashboard"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link href="/login">
                    <FaUser className="text-2xl text-black hover:text-blue-600 transition" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content jump when navbar becomes sticky - only on desktop */}
      {isSticky && <div className="hidden md:block h-20"></div>}
    </>
  );
};

export default Navbar;
