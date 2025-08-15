"use client";

import { useEffect, useState } from "react";

export default function UserPlans() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const [userRes, plansRes] = await Promise.all([
          fetch("/api/user/current-plan"),
          fetch("/api/plans"),
        ]);

        const userData = await userRes.json();
        const plansData = await plansRes.json();

        setCurrentPlan(userData?.currentPlan || null);
        console.log("Current Plan Data:", userData?.currentPlan); // ✅ Add this
        setAllPlans(plansData || []);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Find highest level plan
  const maxLevelPlan = allPlans.reduce(
    (max, plan) => (plan.level > max.level ? plan : max),
    { level: -1 }
  );

  const isHighestPlan = currentPlan?.level >= maxLevelPlan?.level;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Your Current Plan
      </h2>

      {!currentPlan ? (
        <div className="p-6 rounded-2xl bg-yellow-50 text-yellow-700 border border-yellow-200 shadow">
          <p className="mb-4">
            You are currently on the <strong>Free Tier</strong>.
          </p>
          <a
            href="/pricing"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Upgrade Plan
          </a>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-blue-700 mb-2">
            {currentPlan.name}
          </h3>
          <p className="text-gray-600 mb-2">₹{currentPlan.discountedPrice || currentPlan.price}</p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            {currentPlan.features?.map((feature, i) => (
              <li key={i}>
                {typeof feature === 'string' ? feature : feature.text || feature.name || 'Feature'}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Expires On:</span>{" "}
            {currentPlan.renewalDate
                      ? new Date(currentPlan.renewalDate).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
          </p>

          {!isHighestPlan && (
            <div className="mt-4">
              <a
                href="/pricing"
                className="inline-block bg-gray-100 border border-blue-300 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
              >
                Upgrade Plan
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
