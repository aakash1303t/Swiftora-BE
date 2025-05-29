import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

export const InventoryModel = {
  async create(inventoryData) {
    const { data, error } = await supabase.from("Inventory").insert([
      {
        inventoryId: uuidv4(),
        productId: inventoryData.productId,
        supplierId: inventoryData.supplierId,
        quantityOnHand: inventoryData.quantityOnHand || 0,
        stockLevel: inventoryData.stockLevel || "low",
        lastUpdated: inventoryData.lastUpdated || new Date().toISOString(),
      },
    ]);

    return error ? { success: false, error } : { success: true, inventoryId: data[0].inventoryId };
  },

  async findByProductId(productId) {
    const { data, error } = await supabase
      .from("Inventory")
      .select("*")
      .eq("productId", productId)
      .single();

    return error ? null : data;
  },

  async listBySupplier(supplierId) {
    const { data, error } = await supabase
      .from("Inventory")
      .select("*")
      .eq("supplierId", supplierId);

    return error ? [] : data;
  },

  async update(productId, supplierId, updateData) {
    const { error } = await supabase
      .from("Inventory")
      .update(updateData)
      .eq("productId", productId)
      .eq("supplierId", supplierId);

    return error ? { success: false, error } : { success: true };
  },

  async delete(productId, supplierId) {
    const { error } = await supabase
      .from("Inventory")
      .delete()
      .eq("productId", productId)
      .eq("supplierId", supplierId);

    return error ? { success: false, error } : { success: true };
  },

  async createOrUpdate(inventoryData) {
    const existing = await this.findByProductId(inventoryData.productId);
    if (existing) {
      return this.update(inventoryData.productId, inventoryData.supplierId, inventoryData);
    } else {
      return this.create(inventoryData);
    }
  },

  async getAll() {
    const { data, error } = await supabase.from("Inventory").select("*");
    return error ? { success: false, error } : { success: true, data };
  },
};
