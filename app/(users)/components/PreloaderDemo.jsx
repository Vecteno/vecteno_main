"use client";

import React, { useState } from "react";
import LoadingBar, { FullScreenPreloader, PagePreloader, ButtonPreloader } from "./LoadingBar";

const PreloaderDemo = () => {
  const [selectedType, setSelectedType] = useState("gradient");
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedSize, setSelectedSize] = useState("large");
  const [showFullScreen, setShowFullScreen] = useState(false);

  const loaderTypes = [
    "spinner", "pulse", "bounce", "morphing", "wave", 
    "ring", "cube", "dna", "infinity", "gradient"
  ];

  const colors = ["blue", "green", "purple", "red", "yellow", "gray"];
  const sizes = ["small", "medium", "large", "xl"];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🎨 Beautiful Preloader Animations
        </h1>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Customize Your Preloader</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {loaderTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Full Screen Toggle */}
          <div className="mt-6">
            <button
              onClick={() => setShowFullScreen(!showFullScreen)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {showFullScreen ? "Hide" : "Show"} Full Screen Preloader
            </button>
          </div>
        </div>

        {/* Main Demo */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Current Selection: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
          </h2>
          
          <div className="flex justify-center mb-8">
            <LoadingBar 
              type={selectedType} 
              size={selectedSize} 
              color={selectedColor} 
            />
          </div>

          <div className="text-center text-gray-600">
            <p className="mb-4">This is your selected preloader animation</p>
            <p className="text-sm">Perfect for loading states, form submissions, and data fetching</p>
          </div>
        </div>

        {/* All Types Showcase */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            All Animation Types
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {loaderTypes.map((type) => (
              <div
                key={type}
                className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedType(type)}
              >
                <div className="flex justify-center mb-3">
                  <LoadingBar type={type} size="medium" color="blue" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Page Preloader */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Page Preloader</h3>
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <PagePreloader type="spinner" color="blue" />
            </div>
            <p className="text-sm text-gray-600">
              Use for full page loading states
            </p>
          </div>

          {/* Button Preloader */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Button Preloader</h3>
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <ButtonPreloader type="spinner" color="green" />
            </div>
            <p className="text-sm text-gray-600">
              Perfect for form submissions and actions
            </p>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">Usage Code</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import LoadingBar, { FullScreenPreloader, PagePreloader, ButtonPreloader } from './LoadingBar';

// Basic usage
<LoadingBar type="${selectedType}" size="${selectedSize}" color="${selectedColor}" />

// Full screen overlay
<FullScreenPreloader type="gradient" color="blue" />

// Page loader
<PagePreloader type="spinner" color="blue" />

// Button loader
<ButtonPreloader type="spinner" color="green" />`}
          </pre>
        </div>
      </div>

      {/* Full Screen Preloader */}
      {showFullScreen && (
        <FullScreenPreloader 
          type={selectedType} 
          color={selectedColor} 
        />
      )}
    </div>
  );
};

export default PreloaderDemo; 