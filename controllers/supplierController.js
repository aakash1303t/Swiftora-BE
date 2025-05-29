import { Supplier, getTieUpsBySupplierId, acceptTieUpById } from "../models/Supplier.js";
import { User } from "../models/User.js";

export const createSupplier = async (req, res) => {
  try {
    const userId = req.user.userId;  // <-- Use this from middleware
    const { name, contact, location } = req.body;

    const user = await User.getById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const supplierData = {
      user_id: userId,
      username: user.username,
      email: user.email,
      name,
      contact,
      location
    };

    const result = await Supplier.create(supplierData);
    return res.status(201).json({
      message: "Supplier created successfully",
      supplierId: result.supplierId
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getSupplierByUserId = async (req, res) => {
  try {
    const { userId } = req.user;
    const supplier = await Supplier.getByUserId(userId);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    return res.status(200).json(supplier);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { name, contact, location } = req.body;

    const supplier = await Supplier.getById(supplierId);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    const updatedData = { name, contact, location };
    const result = await Supplier.update(supplierId, updatedData);

    return res.status(200).json({
      message: "Supplier updated successfully",
      updatedSupplier: result.updatedSupplier
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getSupplierDashboardData = async (req, res) => {
  try {
    const { userId } = req.user;
    const supplier = await Supplier.getByUserId(userId);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    const supplierId = supplier.supplier_id;

    // Replace with actual queries if needed
    const productsSupplied = [];
    const recentOrders = [];
    const totalSupermarkets = 0;
    const totalWarehouses = 0;

    return res.status(200).json({
      supplierId,
      totalProducts: productsSupplied.length,
      totalOrders: recentOrders.length,
      totalSupermarkets,
      totalWarehouses,
      recentOrders
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
  }
};

export const getSupplierTieUps = async (req, res) => {
  const supplierId = req.user?.userId;

  if (!supplierId) {
    return res.status(400).json({ error: "Supplier ID missing in token." });
  }

  try {
    const tieUps = await getTieUpsBySupplierId(supplierId);
    return res.status(200).json(tieUps);
  } catch (error) {
    console.error("Error fetching tie-ups:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};


export const acceptTieUpBySupplier = async (req, res) => {
  const { supermarketId, supplierId } = req.params;

  if (!supermarketId || !supplierId) {
    return res.status(400).json({ message: "supermarketId and supplierId are required" });
  }

  try {
    const result = await acceptTieUpById(supermarketId, supplierId);
    if (result.success) {
      return res.status(200).json({
        message: "Tie-up accepted successfully",
        data: result.data
      });
    } else {
      return res.status(500).json({
        message: "Failed to accept tie-up",
        error: result.error
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
