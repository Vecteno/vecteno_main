"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiEye,
  FiEyeOff,
  FiShield,
  FiCalendar,
  FiEdit3,
  FiCheck,
  FiX,
  FiSmartphone,
  FiServer,
  FiCreditCard,
  FiSettings,
  FiFileText,
} from "react-icons/fi";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [licenseText, setLicenseText] = useState("");
  const [editingLicense, setEditingLicense] = useState(false);

  // SMTP Configuration states
  const [smtpConfig, setSmtpConfig] = useState({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "",
    password: "",
    senderEmail: "",
  });

  // Razorpay Configuration states
  const [razorpayConfig, setRazorpayConfig] = useState({
    keyId: "",
    keySecret: "",
    webhookSecret: "",
  });

  // Profile editing states
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchAdminData();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) return;

      const response = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.smtp) {
          setSmtpConfig({
            host: data.smtp.host || "smtp.gmail.com",
            port: data.smtp.port || 587,
            secure: data.smtp.secure || false,
            user: data.smtp.user || "",
            password: data.smtp.password || "",
            senderEmail: data.smtp.senderEmail || "",
          });
        }
        if (data.razorpay) {
          setRazorpayConfig({
            keyId: data.razorpay.keyId || "",
            keySecret: data.razorpay.keySecret || "",
            webhookSecret: data.razorpay.webhookSecret || "",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const fetchAdminData = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/admin/profile", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAdminData(data.admin);
        setProfileForm({
          name: data.admin.name || "",
          email: data.admin.email || "",
        });
      } else {
        setError(data.error || "Failed to fetch admin data");
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          router.push("/admin/login");
        }
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (response.ok) {
        setAdminData(data.admin);
        setSuccess("Profile updated successfully!");
        setEditingProfile(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords don't match");
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setSaving(false);
      return;
    }

    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update password");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setError("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handle2FAToggle = async (enabled) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/toggle-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ twoFactorEnabled: enabled }),
      });

      const data = await response.json();
      console.log("2FA Toggle Response:", data);

      if (response.ok) {
        // Update local state with the actual response from server
        setAdminData((prev) => ({
          ...prev,
          twoFactorEnabled: data.twoFactorEnabled,
        }));
        setSuccess(data.message);
        setTimeout(() => setSuccess(""), 3000);

        // Fetch fresh data from server to ensure consistency
        setTimeout(() => {
          fetchAdminData();
        }, 500);
      } else {
        setError(data.message || "Failed to update 2FA setting");
      }
    } catch (err) {
      console.error("Error toggling 2FA:", err);
      setError("Failed to update 2FA setting");
    } finally {
      setSaving(false);
    }
  };

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/settings/smtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(smtpConfig),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("SMTP settings saved successfully!");
        // Refetch settings to update the form with saved values
        await fetchSettings();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to save SMTP settings");
      }
    } catch (err) {
      console.error("Error saving SMTP settings:", err);
      setError("Failed to save SMTP settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSmtpTest = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/settings/smtp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(smtpConfig),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("SMTP connection successful!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "SMTP connection failed");
      }
    } catch (err) {
      console.error("Error testing SMTP:", err);
      setError("Failed to test SMTP connection");
    } finally {
      setSaving(false);
    }
  };

  const handleRazorpaySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/settings/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(razorpayConfig),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Razorpay settings saved successfully!");
        // Refetch settings to update the form with saved values
        await fetchSettings();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to save Razorpay settings");
      }
    } catch (err) {
      console.error("Error saving Razorpay settings:", err);
      setError("Failed to save Razorpay settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRazorpayTest = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/settings/razorpay/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(razorpayConfig),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Razorpay connection successful!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Razorpay connection failed");
      }
    } catch (err) {
      console.error("Error testing Razorpay:", err);
      setError("Failed to test Razorpay connection");
    } finally {
      setSaving(false);
    }
  };

  const handleLicenseSave = async () => {
    try {
      const res = await fetch("/api/admin/settings/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseText }),
      });

      const data = await res.json();
      if (data.success) {
        alert("License updated successfully!");
      }
    } catch (error) {
      console.error("Error saving license:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your admin profile and security settings
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-4 font-medium ${
              activeTab === "profile"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiUser className="w-5 h-5" />
              Profile Information
            </div>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-4 font-medium ${
              activeTab === "security"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiLock className="w-5 h-5" />
              Password
            </div>
          </button>
          <button
            onClick={() => setActiveTab("2fa")}
            className={`px-6 py-4 font-medium ${
              activeTab === "2fa"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiSmartphone className="w-5 h-5" />
              Two-Factor Auth
            </div>
          </button>
          <button
            onClick={() => setActiveTab("smtp")}
            className={`px-6 py-4 font-medium ${
              activeTab === "smtp"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiServer className="w-5 h-5" />
              SMTP Settings
            </div>
          </button>
          <button
            onClick={() => setActiveTab("razorpay")}
            className={`px-6 py-4 font-medium ${
              activeTab === "razorpay"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiCreditCard className="w-5 h-5" />
              Razorpay
            </div>
          </button>

          <button
            onClick={() => setActiveTab("license")}
            className={`px-6 py-4 font-medium ${
              activeTab === "license"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiFileText className="w-5 h-5" />
              License Text
            </div>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="p-6">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Profile Information
              </h3>

              {!editingProfile ? (
                // View Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FiUser className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Name
                        </span>
                      </div>
                      <p className="text-lg text-gray-800">
                        {adminData?.name || "Not set"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FiMail className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Email
                        </span>
                      </div>
                      <p className="text-lg text-gray-800">
                        {adminData?.email || "Not set"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FiShield className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Role
                        </span>
                      </div>
                      <p className="text-lg text-gray-800 capitalize">
                        {adminData?.role || "Admin"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FiCalendar className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Created
                        </span>
                      </div>
                      <p className="text-lg text-gray-800">
                        {adminData?.createdAt
                          ? new Date(adminData.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileForm({
                          name: adminData?.name || "",
                          email: adminData?.email || "",
                        });
                      }}
                      className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* License Tab */}
        {activeTab === "license" && (
          <div className="p-6">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                License Text
              </h3>

              {!editingLicense ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {licenseText || "No license text set"}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditingLicense(true)}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      Edit License
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLicenseSave();
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Text
                    </label>
                    <textarea
                      rows="8"
                      value={licenseText}
                      onChange={(e) => setLicenseText(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingLicense(false)}
                      className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4" />
                          Save License
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="p-6">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Change Password
              </h3>

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.current ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 6 characters required
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2FA Tab */}
        {activeTab === "2fa" && (
          <div className="p-6">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Two-Factor Authentication
              </h3>

              <div className="space-y-6">
                {/* Current Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          adminData?.twoFactorEnabled
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-gray-600">
                          {adminData?.twoFactorEnabled
                            ? "Enhanced security is enabled for your account"
                            : "Add an extra layer of security to your account"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          adminData?.twoFactorEnabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {adminData?.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiShield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">
                        How it works
                      </h4>
                      <p className="text-sm text-blue-700 mb-2">
                        When two-factor authentication is enabled, you'll need
                        to enter a verification code sent to your email each
                        time you log in.
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Enter your email and password as usual</li>
                        <li>• Receive a 6-digit code via email</li>
                        <li>• Enter the code to complete login</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Toggle Controls */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">
                        {adminData?.twoFactorEnabled ? "Disable" : "Enable"}{" "}
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-600">
                        {adminData?.twoFactorEnabled
                          ? "Turn off the extra security layer for your account"
                          : "Secure your account with email-based verification"}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handle2FAToggle(!adminData?.twoFactorEnabled)
                      }
                      disabled={saving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        adminData?.twoFactorEnabled
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          {adminData?.twoFactorEnabled ? (
                            <>
                              <FiX className="w-4 h-4" />
                              Disable 2FA
                            </>
                          ) : (
                            <>
                              <FiCheck className="w-4 h-4" />
                              Enable 2FA
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Warning when enabled */}
                {adminData?.twoFactorEnabled && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FiShield className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-1">
                          Important Notice
                        </h4>
                        <p className="text-sm text-yellow-700">
                          Make sure you have access to your email account (
                          {adminData?.email}) to receive login verification
                          codes. If you lose access to your email, you may be
                          locked out of your account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SMTP Configuration Tab */}
        {activeTab === "smtp" && (
          <div className="p-6">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                SMTP Email Configuration
              </h3>

              <form onSubmit={handleSmtpSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={smtpConfig.host}
                      onChange={(e) =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          host: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={smtpConfig.port}
                      onChange={(e) =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          port: parseInt(e.target.value),
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="587"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={smtpConfig.user}
                    onChange={(e) =>
                      setSmtpConfig((prev) => ({
                        ...prev,
                        user: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Password
                  </label>
                  <input
                    type="password"
                    value={smtpConfig.password}
                    onChange={(e) =>
                      setSmtpConfig((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Gmail App Password"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    For Gmail, use an App Password, not your regular password
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    value={smtpConfig.senderEmail}
                    onChange={(e) =>
                      setSmtpConfig((prev) => ({
                        ...prev,
                        senderEmail: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="noreply@yourcompany.com"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="secure"
                    checked={smtpConfig.secure}
                    onChange={(e) =>
                      setSmtpConfig((prev) => ({
                        ...prev,
                        secure: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="secure"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Use SSL/TLS (Enable for port 465)
                  </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleSmtpTest}
                    disabled={saving}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Testing..." : "Test Connection"}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        Save SMTP Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Razorpay Configuration Tab */}
        {activeTab === "razorpay" && (
          <div className="p-6">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Razorpay Payment Configuration
              </h3>

              <form onSubmit={handleRazorpaySubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razorpay Key ID
                  </label>
                  <input
                    type="text"
                    value={razorpayConfig.keyId}
                    onChange={(e) =>
                      setRazorpayConfig((prev) => ({
                        ...prev,
                        keyId: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="rzp_test_xxxxxxxxxx"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your Razorpay Key ID from dashboard
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razorpay Key Secret
                  </label>
                  <input
                    type="password"
                    value={razorpayConfig.keySecret}
                    onChange={(e) =>
                      setRazorpayConfig((prev) => ({
                        ...prev,
                        keySecret: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Secret Key"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Keep this secret and secure
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Secret (Optional)
                  </label>
                  <input
                    type="password"
                    value={razorpayConfig.webhookSecret}
                    onChange={(e) =>
                      setRazorpayConfig((prev) => ({
                        ...prev,
                        webhookSecret: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Webhook Secret"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    For webhook verification (optional)
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiCreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">
                        Setup Instructions
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Create a Razorpay account at razorpay.com</li>
                        <li>• Get your API keys from the dashboard</li>
                        <li>• Use test keys for development</li>
                        <li>• Enable live keys only in production</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleRazorpayTest}
                    disabled={saving}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Testing..." : "Test Connection"}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        Save Razorpay Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
