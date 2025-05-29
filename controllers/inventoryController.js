import { InventoryModel } from "../models/Inventory.js";

// Update or Create Inventory
export const updateInventory = async (req, res) => {
  try {
    const { productId, quantityOnHand } = req.body;
    const supplierId = req.user.userId;

    let stockLevel = "low";
    if (quantityOnHand > 100) stockLevel = "high";
    else if (quantityOnHand > 50) stockLevel = "medium";

    const inventoryData = {
      productId,
      supplierId,
      quantityOnHand,
      stockLevel,
      lastUpdated: new Date().toISOString(),
    };

    const result = await InventoryModel.createOrUpdate(inventoryData);

    if (result.success) {
      res.json({ message: "Inventory updated successfully", inventory: inventoryData });
    } else {
      res.status(500).json({ message: "Error updating inventory", error: result.error.message });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating inventory", error: error.message });
  }
};

// Get All Inventory Items
export const getInventory = async (req, res) => {
  try {
    const result = await InventoryModel.getAll();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ message: "Error fetching inventory", error: result.error.message });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error: error.message });
  }
};

// Modify Specific Inventory Item
export const modifyInventory = async (req, res) => {
  try {
    const { productId, supplierId, quantityOnHand } = req.body;

    let stockLevel = "low";
    if (quantityOnHand > 100) stockLevel = "high";
    else if (quantityOnHand > 50) stockLevel = "medium";

    const updateData = {
      quantityOnHand,
      stockLevel,
      lastUpdated: new Date().toISOString(),
    };

    const result = await InventoryModel.update(productId, supplierId, updateData);

    if (result.success) {
      res.json({ message: "Inventory modified successfully", inventory: updateData });
    } else {
      res.status(404).json({ message: "Inventory item not found", error: result.error.message });
    }
  } catch (error) {
    res.status(500).json({ message: "Error modifying inventory", error: error.message });
  }
};

// Remove Inventory Item
export const removeInventory = async (req, res) => {
  try {
    const { productId, supplierId } = req.params;

    const result = await InventoryModel.delete(productId, supplierId);

    if (result.success) {
      res.json({ message: "Inventory removed successfully" });
    } else {
      res.status(404).json({ message: "Inventory item not found", error: result.error.message });
    }
  } catch (error) {
    res.status(500).json({ message: "Error removing inventory", error: error.message });
  }
};
