import { supabase } from "../config/supabaseClient.js";

export const Supplier = {
  async create(supplierData) {
    const { data, error } = await supabase
      .from("suppliers")
      .insert([supplierData])
      .select()
      .single();

    if (error) throw new Error("Database Error: Unable to create supplier.");
    return { success: true, supplierId: data.supplier_id };
  },

  async getById(supplierId) {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("supplier_id", supplierId)
      .single();

    if (error) return null;
    return data;
  },

  async getByUserId(userId) {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data;
  },

  async update(supplierId, updates) {
    const { data, error } = await supabase
      .from("suppliers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("supplier_id", supplierId)
      .select()
      .single();

    if (error) throw new Error("Database Error: Unable to update supplier.");
    return { success: true, updatedSupplier: data };
  }
};

export const getTieUpsBySupplierId = async (supplierUserId, status) => {
  console.log("[getTieUpsBySupplierId] supplierUserId:", supplierUserId, "status:", status);

  let query = supabase
    .from("tie_up")
    .select("*, supermarket!fk_tieup_supermarket(*)") // resolve the relationship conflict
    .eq("supplier_user_id", supplierUserId);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[getTieUpsBySupplierId] Error:", error);
    return [];
  }

  console.log("[getTieUpsBySupplierId] Raw data:", data);

  return data.map(tieUp => {
    const supermarket = tieUp.supermarket;
    if (supermarket?.location) {
      supermarket.location.lat = parseFloat(supermarket.location.lat);
      supermarket.location.lng = parseFloat(supermarket.location.lng);
    }
    return { ...tieUp, supermarketDetails: supermarket };
  });
};





export const acceptTieUpById = async (supermarketId, supplierId) => {
  const { data, error } = await supabase
    .from("tie_up")
    .update({ status: "accepted" })
    .eq("supermarket_id", supermarketId)
    .eq("supplier_id", supplierId)
    .select()
    .single();

  if (error) {
    return { success: false, message: "Error accepting tie-up", error: error.message };
  }

  return { success: true, message: "Tie-up accepted successfully", data };
};
