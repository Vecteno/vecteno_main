"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PreloaderDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleStart = () => {
      setIsLoading(true);
    };

    const handleComplete = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    if (pathname) {
      handleStart();
      handleComplete();
    }
  }, [pathname, mounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      {/* Simple Spinning Loader */}
      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );
};

export default PreloaderDemo; 