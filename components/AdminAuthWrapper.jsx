"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAuthWrapper({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
          router.push("/admin/login");
          return;
        }

        const response = await fetch("/api/admin/verify", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        if (response.ok) {
          setIsAuthorized(true);
        } else {
          // Token is invalid, clear it and redirect
          localStorage.removeItem('adminToken');
          router.push("/admin/login");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem('adminToken');
        router.push("/admin/login");
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect before this renders
  }

  return children;
}
