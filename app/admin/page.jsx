'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
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
            // Token is valid, redirect to dashboard
            router.push('/admin/dashboard');
          } else {
            // Token is invalid, clear it and redirect to login
            localStorage.removeItem('adminToken');
            router.push('/admin/login');
          }
        } catch (error) {
          // Network error or API not available, clear token and redirect to login
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }
      } else {
        // No token, redirect to login
        router.push('/admin/login');
      }
      
      setIsChecking(false);
    };

    checkAdminAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Redirecting to admin panel...</span>
        </div>
      </div>
    </div>
  );
}
