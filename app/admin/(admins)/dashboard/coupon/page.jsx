"use client";
import { useEffect, useState } from "react";
import { 
  FiTag, 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiCalendar, 
  FiPercent, 
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiCopy,
  FiHash
} from "react-icons/fi";

export default function CouponPage() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountPercent: "",
    validFrom: "",
    validTill: "",
    usageLimit: "10",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) setCoupons(data.coupons);
    } catch (err) {
      setError("Failed to fetch coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("code", form.code);
      formData.append("discountPercent", form.discountPercent);
      formData.append("validFrom", form.validFrom);
      formData.append("validTill", form.validTill);
      formData.append("usageLimit", form.usageLimit);

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Coupon created successfully!");
        setForm({
          code: "",
          discountPercent: "",
          validFrom: "",
          validTill: "",
          usageLimit: "10",
        });
        setShowForm(false);
        fetchCoupons();
      } else {
        setError(data.message || "Failed to create coupon");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch("/api/admin/coupons/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Coupon deleted successfully!");
        fetchCoupons();
      } else {
        setError("Failed to delete coupon");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      discountPercent: "",
      validFrom: "",
      validTill: "",
      usageLimit: "10",
    });
    setError("");
    setSuccess("");
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code: result });
  };

  const getCouponStatus = (validFrom, validTill, usedBy, usageLimit) => {
    const now = new Date();
    const from = new Date(validFrom);
    const till = new Date(validTill);
    const usageCount = usedBy ? usedBy.length : 0;

    if (now < from) return { status: "upcoming", color: "bg-yellow-100 text-yellow-800", icon: FiClock };
    if (now > till) return { status: "expired", color: "bg-red-100 text-red-800", icon: FiX };
    if (usageCount >= usageLimit) return { status: "fully used", color: "bg-gray-100 text-gray-800", icon: FiUsers };
    return { status: "active", color: "bg-green-100 text-green-800", icon: FiCheckCircle };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess("Coupon code copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Coupons</h1>
            <p className="text-gray-600">Create and manage discount coupon codes for your platform</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FiPlus className="text-lg" />
            {showForm ? "Cancel" : "Create Coupon"}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <FiCheckCircle className="text-green-600 text-xl" />
          <p className="text-green-800 font-medium">{success}</p>
          <button
            onClick={() => setSuccess("")}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <FiX />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="text-red-600 text-xl" />
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Create Coupon Form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl">
              <FiTag className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create New Coupon</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 uppercase"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    required
                  />
                  <FiHash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={generateCouponCode}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Generate Random Code
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter discount %"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                    min="1"
                    max="100"
                    required
                  />
                  <FiPercent className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valid From
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    required
                  />
                  <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valid Till
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    value={form.validTill}
                    onChange={(e) => setForm({ ...form, validTill: e.target.value })}
                    required
                  />
                  <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usage Limit
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter usage limit"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  min="1"
                  required
                />
                <FiUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1">Maximum number of times this coupon can be used</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Create Coupon
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
                <FiTag className="text-white text-lg" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Active Coupons</h2>
            </div>
            <div className="text-sm text-gray-500">
              {coupons.length} coupon{coupons.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {coupons.length === 0 ? (
          <div className="p-12 text-center">
            <FiTag className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No coupons yet</h3>
            <p className="text-gray-500 mb-6">Create your first discount coupon to boost sales</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <FiPlus />
              Create First Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Coupon Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Discount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Validity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon.validFrom, coupon.validTill, coupon.usedBy, coupon.usageLimit);
                  const StatusIcon = status.icon;
                  const usageCount = coupon.usedBy ? coupon.usedBy.length : 0;
                  
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-lg font-mono font-semibold text-sm">
                            {coupon.code}
                          </div>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors"
                            title="Copy to clipboard"
                          >
                            <FiCopy className="text-sm" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                          {coupon.discountPercent}% OFF
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FiUsers className="text-gray-400" />
                            <span>{usageCount} / {coupon.usageLimit}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(usageCount / coupon.usageLimit) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <FiCalendar className="text-gray-400" />
                            <span>From: {new Date(coupon.validFrom).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiCalendar className="text-gray-400" />
                            <span>To: {new Date(coupon.validTill).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                          <StatusIcon className="text-sm" />
                          {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <FiTrash2 className="text-sm" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
