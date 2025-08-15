// /api/admin/pricing/route.js
import connectToDatabase from "@/lib/db";
import PricingPlan from "@/app/models/PricingPlan";

export async function GET() {
  try {
    console.log('GET: Connecting to database...');
    await connectToDatabase();
    console.log('GET: Database connected successfully');
    
    const plans = await PricingPlan.find({ isActive: true }).sort({
      createdAt: -1,
    });
    console.log('Fetched plans successfully:', plans.length);
    return Response.json({ success: true, plans });
  } catch (error) {
    console.error('Error in GET /api/admin/pricing:', error);
    return Response.json(
      { success: false, error: error.message || "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully');
    const body = await req.json(); // this is the actual body
    console.log('Received POST request body:', body);
    
    const {
      name,
      description,
      originalPrice,
      discountedPrice,
      validityInDays,
      features,
      level,
    } = body; // ✅ use 'body' here

    // Validate required fields
    const validationErrors = [];
    
    if (!name || name.trim() === '') {
      validationErrors.push('Plan name is required');
    }
    
    if (originalPrice === undefined || originalPrice === null || originalPrice === '' || isNaN(originalPrice) || parseFloat(originalPrice) < 0) {
      validationErrors.push('Valid original price is required (0 for free plan)');
    }
    
    if (validityInDays === undefined || validityInDays === null || validityInDays === '' || isNaN(validityInDays) || parseInt(validityInDays) < 0) {
      validationErrors.push('Valid validity in days is required (0 for unlimited)');
    }
    
    if (!features || !Array.isArray(features) || features.length === 0) {
      validationErrors.push('At least one feature is required');
    } else {
      // Check if all features are empty
      const hasValidFeatures = features.some(feature => {
        if (typeof feature === 'string') {
          return feature.trim() !== '';
        }
        return feature.text && feature.text.trim() !== '';
      });
      
      if (!hasValidFeatures) {
        validationErrors.push('At least one feature must have text');
      }
    }
    
    if (validationErrors.length > 0) {
      console.log('POST Validation errors:', validationErrors);
      console.log('POST Received data:', { name, originalPrice, validityInDays, features, level, description });
      console.log('POST Full body:', body);
      return Response.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Ensure features are properly formatted
    const formattedFeatures = features.map(feature => {
      if (typeof feature === 'string') {
        return { text: feature, included: true };
      }
      return {
        text: feature.text || '',
        included: feature.included !== false
      };
    }).filter(f => f.text.trim() !== '');

    // Ensure data types are correct for database
    const planData = {
      name: name.trim(),
      description: description?.trim() || '',
      originalPrice: parseFloat(originalPrice),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      validityInDays: parseInt(validityInDays),
      features: formattedFeatures,
      level: parseInt(level) || 1,
      isActive: true
    };

    console.log('Creating plan with data:', planData);

    const plan = new PricingPlan(planData);

    await plan.save();
    console.log('Plan saved successfully:', plan);
    return Response.json({ success: true, plan });
  } catch (error) {
    console.error('Error in POST /api/admin/pricing:', error);
    
    // Provide more specific error messages
    let errorMessage = "Internal server error";
    
    if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${Object.values(error.errors).map(e => e.message).join(', ')}`;
    } else if (error.code === 11000) {
      errorMessage = "A plan with this name already exists";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return Response.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    console.log('PUT: Connecting to database...');
    await connectToDatabase();
    console.log('PUT: Database connected successfully');
    
    const body = await req.json();
    console.log('Received PUT request body:', body);
    
    const {
      _id,
      name,
      description,
      originalPrice,
      discountedPrice,
      features,
      validityInDays,
      level,
    } = body; // ✅ use 'body'

    // Validate required fields
    const validationErrors = [];
    
    if (!_id) {
      validationErrors.push('Plan ID is required for update');
    }
    
    if (!name || name.trim() === '') {
      validationErrors.push('Plan name is required');
    }
    
    if (originalPrice === undefined || originalPrice === null || originalPrice === '' || isNaN(originalPrice) || parseFloat(originalPrice) < 0) {
      validationErrors.push('Valid original price is required (0 for free plan)');
    }
    
    if (validityInDays === undefined || validityInDays === null || validityInDays === '' || isNaN(validityInDays) || parseInt(validityInDays) < 0) {
      validationErrors.push('Valid validity in days is required (0 for unlimited)');
    }
    
    if (!features || !Array.isArray(features) || features.length === 0) {
      validationErrors.push('At least one feature is required');
    } else {
      // Check if all features are empty
      const hasValidFeatures = features.some(feature => {
        if (typeof feature === 'string') {
          return feature.trim() !== '';
        }
        return feature.text && feature.text.trim() !== '';
      });
      
      if (!hasValidFeatures) {
        validationErrors.push('At least one feature must have text');
      }
    }
    
    if (validationErrors.length > 0) {
      console.log('PUT Validation errors:', validationErrors);
      console.log('PUT Received data:', { _id, name, originalPrice, validityInDays, features });
      return Response.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Ensure features are properly formatted
    const formattedFeatures = features.map(feature => {
      if (typeof feature === 'string') {
        return { text: feature, included: true };
      }
      return {
        text: feature.text || '',
        included: feature.included !== false
      };
    }).filter(f => f.text.trim() !== '');

    // Ensure data types are correct for database
    const updateData = {
      name: name.trim(),
      description: description?.trim() || '',
      originalPrice: parseFloat(originalPrice),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      validityInDays: parseInt(validityInDays),
      features: formattedFeatures,
      level: parseInt(level) || 1,
    };

    console.log('Updating plan with data:', updateData);

    const updated = await PricingPlan.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return Response.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    console.log('Plan updated successfully:', updated);
    return Response.json({ success: true, updated });
  } catch (error) {
    console.error('Error in PUT /api/admin/pricing:', error);
    
    // Provide more specific error messages
    let errorMessage = "Internal server error";
    
    if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${Object.values(error.errors).map(e => e.message).join(', ')}`;
    } else if (error.name === 'CastError') {
      errorMessage = "Invalid plan ID format";
    } else if (error.code === 11000) {
      errorMessage = "A plan with this name already exists";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return Response.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectToDatabase();
    const { id } = await req.json();

    await PricingPlan.findByIdAndDelete(id);
    console.log('Plan deleted successfully:', id);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/pricing:', error);
    return Response.json(
      { success: false, error: error.message || "Failed to delete plan" },
      { status: 500 }
    );
  }
}
