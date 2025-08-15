"use client";
import { useEffect, useState } from "react";

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [premiumExpiry, setPremiumExpiry] = useState(null);

  useEffect(() => {
    const fetchPurchasesAndProfile = async () => {
      try {
        const [txRes, userRes] = await Promise.all([
          fetch("/api/user/transactions"),
          fetch("/api/profileInfo"),
        ]);

        const txData = await txRes.json();
        const userData = await userRes.json();

        if (txData.success) {
          setPurchases(txData.transactions);
        }

        if (userData.success && userData.user.premiumExpiresAt) {
          setPremiumExpiry(new Date(userData.user.premiumExpiresAt));
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasesAndProfile();
  }, []);

  const handleDownloadInvoice = async (transactionId) => {
    try {
      const res = await fetch(`/api/invoice/${transactionId}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || `HTTP ${res.status}: Failed to fetch invoice`;
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      
      // Check if the blob is actually a PDF
      if (blob.type !== 'application/pdf') {
        throw new Error('Invalid file format received');
      }
      
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice download failed:", err);
      
      // Show user-friendly error message
      let errorMessage = "Failed to download invoice";
      
      if (err.message.includes("401") || err.message.includes("Not authenticated")) {
        errorMessage = "Please log in to download your invoice";
      } else if (err.message.includes("403") || err.message.includes("Unauthorized")) {
        errorMessage = "You don't have permission to download this invoice";
      } else if (err.message.includes("404") || err.message.includes("Transaction not found")) {
        errorMessage = "Invoice not found";
      } else if (err.message.includes("Invalid file format")) {
        errorMessage = "Invoice file is corrupted or invalid";
      } else if (err.message.includes("Failed to generate invoice")) {
        errorMessage = "Unable to generate invoice at this time. Please try again later.";
      }
      
      alert(errorMessage);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Your Purchase History
      </h2>

      {purchases.length === 0 ? (
        <p className="text-gray-500">You haven’t made any purchases yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl shadow">
            <thead>
              <tr className="bg-blue-100 text-left text-sm text-gray-700 uppercase">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Expires On</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Invoice</th>
              </tr>
            </thead>

            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase._id} className="border-t text-sm">
                  <td className="px-4 py-3">{purchase.razorpayOrderId}</td>
                  <td className="px-4 py-3">
                    {purchase.planId?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    ₹{(purchase.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {purchase.expiresAt
                      ? new Date(purchase.expiresAt).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(purchase.expiresAt) > new Date() ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDownloadInvoice(purchase._id)}
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
