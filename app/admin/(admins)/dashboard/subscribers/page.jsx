"use client";
import { useEffect, useState } from "react";
import { 
  FiSearch, 
  FiFilter, 
  FiCalendar,
  FiUser,
  FiMail,
  FiClock,
  FiStar,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
  FiAlertCircle
} from "react-icons/fi";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("premiumExpiresAt");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers");
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
        setFilteredSubscribers(data.subscribers);
      } else {
        setError(data.error || "Failed to load subscribers");
      }
    } catch (err) {
      setError("Error fetching subscribers");
    } finally {
      setLoading(false);
    }
  };

  // Calculate remaining days
  const getRemainingDays = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Get plan status
  const getPlanStatus = (expiryDate) => {
    const remainingDays = getRemainingDays(expiryDate);
    if (remainingDays === 0) return "expired";
    if (remainingDays <= 7) return "expiring";
    return "active";
  };

  // Get unique plan names for filter
  const planNames = [...new Set(subscribers.map(sub => sub.planName).filter(Boolean))];

  useEffect(() => {
    let filtered = subscribers.filter((subscriber) => {
      const searchMatch = 
        subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscriber.planName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const planMatch = filterPlan === "all" || subscriber.planName === filterPlan;
      
      const statusMatch = filterStatus === "all" || getPlanStatus(subscriber.premiumExpiresAt) === filterStatus;
      
      return searchMatch && planMatch && statusMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "premiumExpiresAt" || sortBy === "createdAt") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSubscribers(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterPlan, filterStatus, sortBy, sortOrder, subscribers]);

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterPlan("all");
    setFilterStatus("all");
    setSortBy("premiumExpiresAt");
    setSortOrder("asc");
  };

  // Stats calculations
  const activeSubscribers = subscribers.filter(sub => getPlanStatus(sub.premiumExpiresAt) === "active").length;
  const expiringSubscribers = subscribers.filter(sub => getPlanStatus(sub.premiumExpiresAt) === "expiring").length;
  const expiredSubscribers = subscribers.filter(sub => getPlanStatus(sub.premiumExpiresAt) === "expired").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Subscribers</h1>
            <p className="text-gray-600 mt-1">Monitor all premium subscribers and their plans</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSubscribers}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw className="text-sm" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-blue-600">{subscribers.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUsers className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-green-600">{activeSubscribers}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <FiTrendingUp className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{expiringSubscribers}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <FiAlertCircle className="text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{expiredSubscribers}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <FiClock className="text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Plans</option>
              {planNames.map(plan => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="premiumExpiresAt">Sort by Expiry</option>
              <option value="name">Sort by Name</option>
              <option value="createdAt">Sort by Join Date</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>

            <button
              onClick={clearFilters}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Items per page */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubscribers.length)} of {filteredSubscribers.length} subscribers
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSubscribers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">No subscribers found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedSubscribers.map((subscriber) => {
                  const remainingDays = getRemainingDays(subscriber.premiumExpiresAt);
                  const status = getPlanStatus(subscriber.premiumExpiresAt);
                  
                  return (
                    <tr key={subscriber._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {subscriber.name ? subscriber.name.charAt(0).toUpperCase() : subscriber.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {subscriber.name || "No Name"}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FiMail className="mr-1" />
                              {subscriber.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <FiStar className="text-yellow-500 mr-1" />
                            {subscriber.planName || "Premium Plan"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Started: {subscriber.createdAt ? new Date(subscriber.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            }) : "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            Expires: {subscriber.premiumExpiresAt ? new Date(subscriber.premiumExpiresAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            }) : "Never"}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiClock className="mr-1" />
                            {remainingDays > 0 ? `${remainingDays} days left` : "Expired"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : status === "expiring"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {status === "active" && <FiTrendingUp className="mr-1" />}
                          {status === "expiring" && <FiAlertCircle className="mr-1" />}
                          {status === "expired" && <FiClock className="mr-1" />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              <FiChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              Next
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
