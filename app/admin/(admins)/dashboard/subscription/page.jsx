"use client";
import { useEffect, useState } from "react";
import { 
  FiCreditCard, 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiCalendar, 
  FiDollarSign, 
  FiCheck,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiAward,
  FiHeart
} from "react-icons/fi";

export default function AdminSubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    _id: null,
    name: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    features: [{ text: "", included: true }],
    validityInDays: "",
    level: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      console.log('Fetching plans...');
      const res = await fetch("/api/admin/pricing");
      
      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Check if response has content
      const responseText = await res.text();
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        throw new Error("Invalid JSON response from server");
      }

      console.log('Fetched plans response:', data);
      
      if (data.success) {
        const transformedPlans = data.plans.map(plan => ({
          ...plan,
          features: plan.features.map(feature => {
            if (typeof feature === 'string') {
              return { text: feature, included: true };
            } else if (typeof feature === 'object') {
              return {
                text: feature.text || '',
                included: feature.included !== false
              };
            }
            return { text: '', included: true };
          })
        }));
        setPlans(transformedPlans);
        console.log('Transformed plans:', transformedPlans);
      } else {
        throw new Error(data.error || "Failed to fetch plans");
      }
    } catch (err) {
      console.error('Fetch plans error:', err);
      setError(err.message || "Failed to fetch plans");
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
      // Client-side validation
      const validationErrors = [];
      
      if (!form.name || form.name.trim() === '') {
        validationErrors.push('Plan name is required');
      }
      
      if (form.originalPrice === '' || isNaN(parseFloat(form.originalPrice)) || parseFloat(form.originalPrice) < 0) {
        validationErrors.push('Valid original price is required (0 for free plan)');
      }
      
      if (form.validityInDays === '' || isNaN(parseInt(form.validityInDays)) || parseInt(form.validityInDays) < 0) {
        validationErrors.push('Valid validity in days is required (0 for unlimited)');
      }
      
      if (!form.level || isNaN(parseInt(form.level)) || parseInt(form.level) <= 0) {
        validationErrors.push('Valid plan level is required');
      }
      
      // Check features
      const validFeatures = form.features.filter(f => f.text && f.text.trim() !== '');
      if (validFeatures.length === 0) {
        validationErrors.push('At least one feature with text is required');
      }
      
      // For editing, ensure we have an ID
      if (isEditing && !form._id) {
        validationErrors.push('Plan ID is missing for update');
      }
      
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setIsSubmitting(false);
        return;
      }

      const method = isEditing ? "PUT" : "POST";
      // Ensure data types are correct
      const submitData = {
        ...form,
        name: form.name.trim(),
        description: form.description ? form.description.trim() : '',
        originalPrice: parseFloat(form.originalPrice),
        discountedPrice: form.discountedPrice ? parseFloat(form.discountedPrice) : null,
        validityInDays: parseInt(form.validityInDays),
        level: parseInt(form.level),
        features: form.features
          .filter(f => f.text && f.text.trim() !== '')
          .map(f => ({
            text: f.text.trim(),
            included: f.included !== false
          }))
      };

      console.log('Submitting data:', submitData);
      console.log('Method:', method);
      console.log('Features being sent:', submitData.features);

      const res = await fetch("/api/admin/pricing", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      // Get response text first to handle both success and error cases
      const responseText = await res.text();
      console.log('Response text:', responseText);
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      console.log('Response data:', data);

      // Check if response is ok
      if (!res.ok) {
        const errorMessage = data.error || `HTTP error! status: ${res.status}`;
        console.error('Server error:', errorMessage);
        throw new Error(errorMessage);
      }
      
             if (data.success) {
         setSuccess(isEditing ? "Plan updated successfully!" : "Plan created successfully!");
         resetForm();
         setShowForm(false);
         fetchPlans();
       } else {
         setError(data.error || "Failed to save plan");
       }
     } catch (err) {
       console.error('Submit error:', err);
       setError(err.message || "Something went wrong");
     } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Check if response has content
      const responseText = await res.text();
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        throw new Error("Invalid JSON response from server");
      }
      if (data.success) {
        setSuccess("Plan deleted successfully!");
        fetchPlans();
      } else {
        setError("Failed to delete plan");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleEdit = (plan) => {
    console.log('Editing plan:', plan);
    console.log('Plan features:', plan.features);
    
    const mappedFeatures = plan.features.length > 0 ? plan.features.map(feature => {
      if (typeof feature === 'string') {
        return { text: feature, included: true };
      } else if (typeof feature === 'object') {
        return {
          text: feature.text || "",
          included: feature.included !== false
        };
      }
      return { text: "", included: true };
    }) : [{ text: "", included: true }];
    
    console.log('Mapped features:', mappedFeatures);
    
    setForm({
      _id: plan._id,
      name: plan.name || "",
      description: plan.description || "",
      originalPrice: plan.originalPrice || "",
      discountedPrice: plan.discountedPrice || "",
      features: mappedFeatures,
      validityInDays: plan.validityInDays || "",
      level: plan.level || "",
      isActive: plan.isActive,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      _id: null,
      name: "",
      description: "",
      originalPrice: "",
      discountedPrice: "",
      features: [{ text: "", included: true }],
      validityInDays: "",
      level: "",
      isActive: true,
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...form.features];
    newFeatures[index] = { ...newFeatures[index], text: value || "" };
    setForm({ ...form, features: newFeatures });
  };

  const toggleFeatureIncluded = (index) => {
    const newFeatures = [...form.features];
    const currentFeature = newFeatures[index];
    const newIncluded = !currentFeature.included;
    
    console.log(`Toggling feature ${index}:`, currentFeature, 'to included:', newIncluded);
    
    newFeatures[index] = { ...currentFeature, included: newIncluded };
    setForm({ ...form, features: newFeatures });
  };

  const addFeature = () => {
    setForm({ ...form, features: [...form.features, { text: "", included: true }] });
  };

  const removeFeature = (index) => {
    const newFeatures = form.features.filter((_, i) => i !== index);
    setForm({ ...form, features: newFeatures.length > 0 ? newFeatures : [{ text: "", included: true }] });
  };

  const getPlanIcon = (level) => {
    const numLevel = parseInt(level);
    
    switch (numLevel) {
      case 1:
        return FiStar;
      case 2:
        return FiAward;
      case 3:
        return FiHeart;
      default:
        return FiCreditCard;
    }
  };

  const getPlanColor = (level) => {
    // Ensure level is a number and handle all cases
    const numLevel = parseInt(level);
    switch (numLevel) {
      case 1: return "from-blue-500 to-blue-600";
      case 2: return "from-purple-500 to-purple-600";
      case 3: return "from-yellow-500 to-yellow-600";
      default: return "from-gray-500 to-gray-600";
    }
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Subscription Plans</h1>
            <p className="text-gray-600">Create and manage subscription plans with features and pricing</p>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
                setShowForm(false);
              } else {
                setShowForm(true);
              }
            }}
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FiPlus className="text-lg" />
            {showForm ? "Cancel" : "Create Plan"}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <FiCheckCircle className="text-green-600 text-xl" />
          <p className="text-green-800 font-medium">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto text-green-600 hover:text-green-800">
            <FiX />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="text-red-600 text-xl" />
          <p className="text-red-800 font-medium">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-600 hover:text-red-800">
            <FiX />
          </button>
        </div>
      )}

      {/* Create/Edit Plan Form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl">
              <FiCreditCard className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? "Edit Subscription Plan" : "Create New Plan"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Name</label>
                <input
                  type="text"
                  placeholder="Enter plan name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value || "" })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Level</label>
                <input
                  type="number"
                  placeholder="Enter plan level (1, 2, 3...)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value || "" })}
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Enter plan description"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value || "" })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter original price"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value || "" })}
                    min="0"
                    step="0.01"
                    required
                  />
                  <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discounted Price (Optional)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter discounted price"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    value={form.discountedPrice}
                    onChange={(e) => setForm({ ...form, discountedPrice: e.target.value || "" })}
                    min="0"
                    step="0.01"
                  />
                  <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Validity (Days)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter validity in days (0 for unlimited)"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    value={form.validityInDays}
                    onChange={(e) => setForm({ ...form, validityInDays: e.target.value || "" })}
                    min="0"
                    required
                  />
                  <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Features</label>
              <div className="space-y-3">
                {form.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleFeatureIncluded(index)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        feature.included 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      title={feature.included ? "Feature included" : "Feature not included"}
                    >
                      {feature.included ? <FiCheck className="text-sm" /> : <FiX className="text-sm" />}
                    </button>
                    <input
                      type="text"
                      placeholder={`Feature ${index + 1}`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      value={feature.text}
                      onChange={(e) => handleFeatureChange(index, e.target.value || "" )}
                    />
                    {form.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Remove feature"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-2"
                >
                  <FiPlus className="text-sm" />
                  Add Feature
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <FiCheck />
                    {isEditing ? "Update Plan" : "Create Plan"}
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

      {/* Plans List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg">
                <FiCreditCard className="text-white text-lg" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Subscription Plans</h2>
            </div>
            <div className="text-sm text-gray-500">
              {plans.length} plan{plans.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="p-12 text-center">
            <FiCreditCard className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No plans yet</h3>
            <p className="text-gray-500 mb-6">Create your first subscription plan to start monetizing</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <FiPlus />
              Create First Plan
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {plans.map((plan) => {
                console.log('Processing plan:', plan);
                
                // Get the icon with fallback
                let PlanIcon;
                try {
                  PlanIcon = getPlanIcon(plan.level);
                } catch (error) {
                  console.error('Error getting plan icon:', error);
                  PlanIcon = FiCreditCard;
                }
                
                const planColor = getPlanColor(plan.level);
                
                // Safety check to ensure PlanIcon is a valid component
                if (!PlanIcon || typeof PlanIcon !== 'function') {
                  console.error('Invalid PlanIcon for level:', plan.level, 'PlanIcon:', PlanIcon);
                  PlanIcon = FiCreditCard; // Use fallback instead of skipping
                }
                
                return (
                  <div key={plan._id} className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Plan Header */}
                    <div className={`bg-gradient-to-r ${planColor} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <PlanIcon className="text-xl" />
                        </div>
                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                          Level {plan.level}
                        </span>
                      </div>
                                             <h3 className="text-2xl font-bold mb-2">{plan.name || "Unnamed Plan"}</h3>
                       <p className="text-white/80 text-sm">{plan.description || "No description"}</p>
                    </div>

                    {/* Plan Pricing */}
                    <div className="p-6">
                      <div className="text-center mb-6">
                                                 {plan.discountedPrice ? (
                           <div>
                             <span className="text-2xl text-gray-400 line-through">₹{plan.originalPrice || 0}</span>
                             <div className="text-3xl font-bold text-gray-800">₹{plan.discountedPrice || 0}</div>
                           </div>
                         ) : (
                           <div className="text-3xl font-bold text-gray-800">₹{plan.originalPrice || 0}</div>
                         )}
                         <p className="text-sm text-gray-600 mt-2">
                           {plan.validityInDays === 0 ? (
                             <strong>Unlimited</strong>
                           ) : (
                             <>Valid for <strong>{plan.validityInDays}</strong> days</>
                           )}
                         </p>
                      </div>

                                             {/* Features List */}
                       <div className="space-y-3 mb-6">
                         {plan.features.map((feature, index) => (
                           <div key={index} className="flex items-center gap-3">
                             {feature.included ? (
                               <FiCheck className="text-green-500 text-sm flex-shrink-0" />
                             ) : (
                               <FiX className="text-red-500 text-sm flex-shrink-0" />
                             )}
                             <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                               {feature.text}
                             </span>
                           </div>
                         ))}
                       </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <FiEdit className="text-sm" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <FiTrash2 className="text-sm" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}