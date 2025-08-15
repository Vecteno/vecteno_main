"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AdminLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
          // Store the current path to redirect after login
          const currentPath = window.location.pathname;
          console.log('No token found, storing redirect path:', currentPath);
          localStorage.setItem('redirectAfterLogin', currentPath);
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
          console.log('Auth successful, showing page');
          setIsAuthorized(true);
        } else {
          console.log('Auth failed, token invalid');
          localStorage.removeItem('adminToken');
          // Store the current path to redirect after login
          const currentPath = window.location.pathname;
          localStorage.setItem('redirectAfterLogin', currentPath);
          router.push("/admin/login");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem('adminToken');
        // Store the current path to redirect after login
        const currentPath = window.location.pathname;
        localStorage.setItem('redirectAfterLogin', currentPath);
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
    return null;
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}


// import { Geist, Geist_Mono } from "next/font/google";
// import "/app/globals.css";
// import Sidebar from "../components/Sidebar";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "Admin Login",
//   description: "Admin login page for Vecteno",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>
//         <div className="flex min-h-screen">
//           {/* Sidebar */}
//           <Sidebar />

//           {/* Page Content */}
//           <div className="flex-1 overflow-y-auto bg-white p-6">
//             {children}
//           </div>
//         </div>
//       </body>
//     </html>
//   );
// }
