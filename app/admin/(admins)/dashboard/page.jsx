'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FiUsers, 
  FiImage, 
  FiDownload, 
  FiTrendingUp, 
  FiEye, 
  FiHeart,
  FiDollarSign,
  FiActivity,
  FiClock,
  FiStar,
  FiGift
} from "react-icons/fi";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [chartData, setChartData] = useState([]);


  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();

      if (res.ok) {
        const combined = monthNames.map((name, idx) => ({
          name,
          users: data.users[idx] || 0,
          images: data.images[idx] || 0,
          downloads: data.downloads ? data.downloads[idx] || 0 : 0
        }));
        setChartData(combined);
      }
    };

    fetchStats();
  }, []);
  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }
      
      try {
        // Verify token with server
        const response = await fetch('/api/admin/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        if (!response.ok) {
          // Token is invalid, clear it and redirect to login
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
          return;
        }
        
        // Token is valid, user is authenticated
        setIsAuthenticating(false);
        
      } catch (error) {
        // Network error or API not available, redirect to login
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch dashboard data only after authentication
  useEffect(() => {
    if (isAuthenticating) return; // Don't fetch data until authenticated
    
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          setError(json.error || "Error fetching data");
        }
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticating]);

  if (isAuthenticating || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isAuthenticating ? 'Verifying authentication...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium text-xl">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Real data for activities
  const recentActivities = [
    ...(data.recentUsers || []).slice(0, 3).map((user, index) => ({
      id: `user-${index}`,
      action: "New user registered",
      user: user.email,
      time: new Date(user.createdAt).toLocaleDateString(),
      type: "user"
    })),
    ...(data.recentImages || []).slice(0, 2).map((image, index) => ({
      id: `image-${index}`,
      action: "Image uploaded",
      user: image.title,
      time: new Date(image.createdAt).toLocaleDateString(),
      type: "upload"
    }))
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
        <StatCard
          title="Total Users"
          value={data.userCount || 0}
          icon={FiUsers}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Images"
          value={data.imageCount || 0}
          icon={FiImage}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Total Downloads"
          value={data.downloadCount || 0}
          icon={FiDownload}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Revenue"
          value={`₹${data.revenue || 0}`}
          icon={FiDollarSign}
          color="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Trending Images"
          value={data.trendingCount || 0}
          icon={FiTrendingUp}
          color="from-pink-500 to-pink-600"
        />
        <StatCard
          title="Premium Content"
          value={data.premiumCount || 0}
          icon={FiStar}
          color="from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Charts and Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Platform Activity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Downloads</span>
                </div>
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end gap-1 h-48">
                    <div 
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{ height: `${(item.users / 100) * 100}%` }}
                    ></div>
                    <div 
                      className="flex-1 bg-purple-500 rounded-t"
                      style={{ height: `${(item.images / 100) * 100}%` }}
                    ></div>
                    <div 
                      className="flex-1 bg-green-500 rounded-t"
                      style={{ height: `${(item.downloads / 100) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              title="Upload Image"
              description="Add new content to your platform"
              icon={FiImage}
              color="from-purple-500 to-purple-600"
              href="/admin/dashboard/upload"
            />
            <QuickActionCard
              title="Manage Users"
              description="View and manage user accounts"
              icon={FiUsers}
              color="from-blue-500 to-blue-600"
              href="/admin/dashboard/users"
            />
            <QuickActionCard
              title="View Analytics"
              description="Detailed platform analytics"
              icon={FiTrendingUp}
              color="from-green-500 to-green-600"
              href="/admin/analytics"
            />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiActivity className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Recent Activities</h3>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, change, changeType }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="text-white text-2xl" />
        </div>
        <div className="mx-2">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ title, description, icon: Icon, color, href }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
      <div className={`p-3 rounded-lg bg-gradient-to-r ${color} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="text-white text-xl" />
      </div>
      <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ activity }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return <FiUsers className="text-blue-500" />;
      case 'upload': return <FiImage className="text-purple-500" />;
      case 'subscription': return <FiDollarSign className="text-green-500" />;
      case 'download': return <FiDownload className="text-orange-500" />;
      case 'offer': return <FiGift className="text-red-500" />;
      default: return <FiActivity className="text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="p-2 bg-gray-100 rounded-lg">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{activity.action}</p>
        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
      </div>
    </div>
  );
}