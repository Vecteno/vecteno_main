"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiUpload, 
  FiImage, 
  FiUsers, 
  FiLayers, 
  FiGift, 
  FiTag, 
  FiCreditCard, 
  FiTrendingUp, 
  FiLogOut,
  FiBarChart2,
  FiSettings,
  FiFolder,
  FiDollarSign
} from "react-icons/fi";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Debug: Log current pathname
  console.log('Current pathname:', pathname);

  const handleLogout = async () => {
    try {
      await fetch("/api/adminLogout", { method: "POST" });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear localStorage regardless of API response
      localStorage.removeItem('adminToken');
      router.push("/admin/login");
    }
  };

  const menuItems = [
    { 
      href: "/admin/dashboard", 
      label: "Dashboard", 
      icon: FiHome,
      color: "bg-blue-500"
    },
    { 
      href: "/admin/dashboard/images", 
      label: "All Products", 
      icon: FiImage,
      color: "bg-purple-500"
    },
    { 
      href: "/admin/categories", 
      label: "Categories", 
      icon: FiFolder,
      color: "bg-cyan-500"
    },
    { 
      href: "/admin/dashboard/users", 
      label: "Users", 
      icon: FiUsers,
      color: "bg-orange-500"
    },
    { 
      href: "/admin/dashboard/banner", 
      label: "Home Page Banner", 
      icon: FiLayers,
      color: "bg-pink-500"
    },
    { 
      href: "/admin/dashboard/offers", 
      label: "Pop-up", 
      icon: FiGift,
      color: "bg-red-500"
    },
    { 
      href: "/admin/dashboard/coupon", 
      label: "Coupon Code", 
      icon: FiTag,
      color: "bg-indigo-500"
    },
    { 
      href: "/admin/dashboard/subscription", 
      label: "Subscriptions", 
      icon: FiCreditCard,
      color: "bg-teal-500"
    },
    { 
      href: "/admin/dashboard/mostdownloadable", 
      label: "Trending", 
      icon: FiTrendingUp,
      color: "bg-yellow-500"
    },
    { 
      href: "/admin/dashboard/subscribers", 
      label: "Subscribers", 
      icon: FiDollarSign,
      color: "bg-green-500"
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="sm:hidden flex justify-between items-center bg-gray-900 text-white p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <FiBarChart2 className="text-white text-lg" />
          </div>
          <h2 className="text-xl font-bold">Vecteno Admin</h2>
        </div>
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="text-white text-2xl p-2 rounded-lg hover:bg-gray-800"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white w-64 h-screen flex flex-col 
        ${menuOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"} 
        transition-transform duration-300 ease-in-out`}
      >
        {/* Brand - Fixed at top */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FiBarChart2 className="text-white text-xl" />
            </div>
            <div>
              <a href='/'  className="text-xl font-bold text-white">Vecteno</a>
              <p className="text-gray-400 text-sm">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Menu Items - Scrollable area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              // More flexible active state checking
              const isActive = pathname === item.href || 
                              (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              const IconComponent = item.icon;
              
              // Debug log for each menu item
              console.log(`Menu item: ${item.label}, href: ${item.href}, pathname: ${pathname}, isActive: ${isActive}`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors duration-200
                    ${
                      isActive
                        ? `${item.color} text-white shadow-lg`
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                >
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - Settings & Logout - Fixed at bottom */}
        <div className="p-4 border-t border-gray-700 space-y-2 flex-shrink-0">
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === '/admin/settings' || pathname.startsWith('/admin/settings')
                ? 'bg-gray-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <FiSettings size={18} />
            <span>Settings</span>
          </Link>

          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-300 hover:text-white hover:bg-red-600 transition-colors"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;