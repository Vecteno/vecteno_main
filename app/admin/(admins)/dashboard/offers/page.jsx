"use client";
import { useEffect, useState } from "react";
import { 
  FiGift, 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiCalendar, 
  FiPercent, 
  FiFileText,
  FiImage,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiX
} from "react-icons/fi";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    discountPercent: "",
    validFrom: "",
    validTill: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/offers");
      const data = await res.json();
      if (data.success) setOffers(data.offers);
    } catch (err) {
      setError("Failed to fetch offers");
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
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("discountPercent", form.discountPercent);
      formData.append("validFrom", form.validFrom);
      formData.append("validTill", form.validTill);
      formData.append("image", image);

      const res = await fetch("/api/admin/offers", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Offer created successfully!");
        setForm({
          title: "",
          description: "",
          discountPercent: "",
          validFrom: "",
          validTill: "",
        });
        setImage(null);
        setImagePreview(null);
        setShowForm(false);
        fetchOffers();
      } else {
        setError(data.message || "Failed to create offer");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;

    try {
      const res = await fetch("/api/admin/offers/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Offer deleted successfully!");
        fetchOffers();
      } else {
        setError("Failed to delete offer");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      discountPercent: "",
      validFrom: "",
      validTill: "",
    });
    setImage(null);
    setImagePreview(null);
    setError("");
    setSuccess("");
  };

  const getOfferStatus = (validFrom, validTill) => {
    const now = new Date();
    const from = new Date(validFrom);
    const till = new Date(validTill);

    if (now < from) return { status: "upcoming", color: "bg-yellow-100 text-yellow-800", icon: FiClock };
    if (now > till) return { status: "expired", color: "bg-red-100 text-red-800", icon: FiX };
    return { status: "active", color: "bg-green-100 text-green-800", icon: FiCheckCircle };
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Offers</h1>
            <p className="text-gray-600">Create and manage promotional offers for your platform</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FiPlus className="text-lg" />
            {showForm ? "Cancel" : "Create Offer"}
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

      {/* Create Offer Form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <FiGift className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create New Offer</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Offer Title
                </label>
                <input
                  type="text"
                  placeholder="Enter offer title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter discount %"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter offer description"
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valid From
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                Offer Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImage(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                  className="hidden"
                  id="image-upload"
                  required
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <FiImage className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </label>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Create Offer
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

      {/* Offers List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <FiGift className="text-white text-lg" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Active Offers</h2>
            </div>
            <div className="text-sm text-gray-500">
              {offers.length} offer{offers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {offers.length === 0 ? (
          <div className="p-12 text-center">
            <FiGift className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No offers yet</h3>
            <p className="text-gray-500 mb-6">Create your first promotional offer to attract more users</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <FiPlus />
              Create First Offer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Offer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Discount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Validity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {offers.map((offer) => {
                  const status = getOfferStatus(offer.validFrom, offer.validTill);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={offer._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {offer.image && (
                            <img
                              src={offer.image}
                              alt={offer.title}
                              className="w-12 h-12 object-cover rounded-lg shadow-sm"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-800">{offer.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                          {offer.discountPercent}% OFF
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <FiCalendar className="text-gray-400" />
                            <span>From: {new Date(offer.validFrom).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiCalendar className="text-gray-400" />
                            <span>To: {new Date(offer.validTill).toLocaleDateString()}</span>
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
                          onClick={() => handleDelete(offer._id)}
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