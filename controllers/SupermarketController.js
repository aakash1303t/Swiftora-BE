import { Supermarket  } from "../models/Supermarket.js";
import { User } from "../models/User.js";
import { supabase } from "../config/supabaseClient.js";

// Create Supermarket
export const createSupermarket = async (req, res) => {
  try {
    const { userId, supermarketName, phone, username, email, location } = req.body;

    const user = await User.getById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "supermarket") return res.status(403).json({ message: "Unauthorized role" });

    const result = await Supermarket.create({
      user_id: userId,
      supermarket_name: supermarketName,
      phone,
      username,
      email,
      location,
    });

    res.status(201).json({
      message: "Supermarket created successfully",
      supermarketId: result.supermarketId,
    });
  } catch (error) {
    console.error("❌ Error creating supermarket:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get Supermarket by user ID
export const getSupermarketByUserId = async (req, res) => {
  try {
    const userId = req.user.userId;
    const supermarket = await Supermarket.getByUserId(userId);
    if (!supermarket) return res.status(404).json({ message: "Supermarket not found" });

    res.status(200).json(supermarket);
  } catch (error) {
    console.error("❌ Error fetching supermarket by user ID:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update Supermarket
export const updateSupermarket = async (req, res) => {
  try {
    const { supermarketId } = req.params;
    const { supermarket_name, phone, location } = req.body;

    const existing = await Supermarket.getById(supermarketId, req.user.userId);
    if (!existing) return res.status(404).json({ message: "Supermarket not found" });

    const updatedSupermarket = await Supermarket.update(supermarketId, {
      supermarket_name,
      phone,
      location,
    });

    res.status(200).json({
      message: "Supermarket updated successfully",
      updatedSupermarket,
    });
  } catch (error) {
    console.error("❌ Error updating supermarket:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// Delete Supermarket
export const deleteSupermarket = async (req, res) => {
  try {
    const { supermarketId } = req.params;
    const existing = await Supermarket.getById(supermarketId, req.user.userId);
    if (!existing) return res.status(404).json({ message: "Supermarket not found" });

    const result = await Supermarket.delete(supermarketId);
    if (result.success) {
      return res.status(200).json({ message: "Supermarket deleted successfully" });
    } else {
      return res.status(500).json({ message: "Error deleting supermarket" });
    }
  } catch (error) {
    console.error("❌ Error deleting supermarket:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get Supermarket Profile (includes user + supermarket)
// In supermarket controller (backend)
export const getSupermarketProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from('supermarket')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Supermarket not found' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error fetching supermarket profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Fetch all suppliers with basic product info
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supermarket.fetchAllSuppliers();

    const suppliersWithProducts = await Promise.all(
      suppliers.map(async (supplier) => {
        const products = await Supermarket.fetchProductsBySupplierId(supplier.supplier_id);
        return {
          ...supplier,
          products: products.map((p) => ({
            productId: p.product_id,
            productName: p.product_name,
          })),
        };
      })
    );

    res.status(200).json(suppliersWithProducts);
  } catch (error) {
    console.error("❌ Error fetching suppliers:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Request Tie-Up
export const requestTieUp = async (req, res) => {
  try {
    const supermarketUserId = req.user.userId;
    const { supplierId } = req.body;

    const result = await Supermarket.requestTieUp(supermarketUserId, supplierId);

    if (result.error) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({
      message: "Tie-up request sent successfully",
      tieUp: result.data,
    });
  } catch (error) {
    console.error("❌ Error in requestTieUp:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get Tie-Up Status
export const getTieUpStatus = async (req, res) => {
  const supermarketUserId = req.user.userId; // from JWT
  const { supplierId } = req.query;

  console.log("supermarketUserId:", supermarketUserId);
  console.log("supplierId:", supplierId);
   
  if (!supplierId) {
    return res.status(400).json({ message: "supplierId is required" });
  }

  try {
    const result = await Supermarket.getTieUpStatusFromModel(supermarketUserId, supplierId);

    if (result.error) {
      return res.status(result.statusCode || 500).json({ message: result.message });
    }

    return res.status(200).json({ tieUp: result.data });
  } catch (err) {
    console.error("Unhandled error in getTieUpStatus:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// Supermarket Dashboard
export const getSupermarketDashboardData = async (req, res) => {
  try {
    const { userId } = req.user;
    const supermarket = await Supermarket.getByUserId(userId);
    if (!supermarket) return res.status(404).json({ message: "Supermarket not found" });

    const metrics = await Supermarket.getDashboardMetrics(supermarket.supermarket_id);

    res.status(200).json({
      supermarketId: supermarket.supermarket_id,
      ...metrics,
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all accepted tie-ups (status = 'accepted') for supermarket

export const getacceptTieUpStatus = async (req, res) => {
  try {
    const supermarketUserId = req.user.userId;
    console.log("Supermarket User ID (backend):", supermarketUserId);

    // Step 1: Get accepted tie-ups for this supermarket user
    const { data: tieUps, error: tieUpError } = await supabase
      .from("tie_up")
      .select("*") // fetch all tie-up fields
      .eq("supermarket_user_id", supermarketUserId)
      .eq("status", "accepted");

    if (tieUpError) {
      console.error("❌ Supabase tie_up query error:", tieUpError);
      return res.status(500).json({ message: "Error fetching tie-ups", error: tieUpError.message });
    }

    console.log("Tie-ups found:", tieUps);

    if (!tieUps || tieUps.length === 0) {
      return res.status(200).json({ message: "No accepted tie-ups found", acceptedTieUps: [] });
    }

    // Extract supplier_user_ids from tieUps
    const supplierUserIds = tieUps.map(t => t.supplier_user_id);

    // Step 2: Fetch supplier details from suppliers table by supplier_user_ids
    const { data: suppliers, error: suppliersError } = await supabase
      .from("suppliers")
      .select("*")
      .in("user_id", supplierUserIds);

    if (suppliersError) {
      console.error("❌ Supabase suppliers query error:", suppliersError);
      return res.status(500).json({ message: "Error fetching suppliers", error: suppliersError.message });
    }

    console.log("Suppliers found:", suppliers);

    // Step 3: Merge tie-up details into suppliers by matching supplier user_id
    const mergedData = suppliers.map(supplier => {
      // Find the matching tie-up entry for this supplier
      const tieUp = tieUps.find(t => t.supplier_user_id === supplier.user_id);
      return {
        ...supplier,
        tie_up_id: tieUp?.tie_up_id || null,
        supermarket_id: tieUp?.supermarket_id || null,
        supermarket_user_id: tieUp?.supermarket_user_id || null,
        status: tieUp?.status || null,
        requested_at: tieUp?.requested_at || null,
      };
    });

    // Return merged array
    res.status(200).json({
      message: "Accepted tie-ups fetched successfully",
      acceptedTieUps: mergedData,
    });
  } catch (error) {
    console.error("❌ Error in getacceptTieUpStatus:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
