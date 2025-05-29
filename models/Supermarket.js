import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from 'uuid';

export const Supermarket = {
  // Create a new supermarket record
  async create(supermarketData) {
    const { data, error } = await supabase
      .from('supermarket')
      .insert([
        {
          user_id: supermarketData.user_id,
          username: supermarketData.username,
          supermarket_name: supermarketData.supermarketName,
          email: supermarketData.email,
          phone: supermarketData.phone,
          location: supermarketData.location || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error (supermarket):', error);
      return { success: false, error };
    }

    return { success: true, supermarketId: data.supermarket_id };
  },

  // Fetch a specific supermarket by ID and user ID
  async getById(supermarketId, userId) {
    const { data, error } = await supabase
      .from('supermarket')
      .select('*')
      .eq('supermarket_id', supermarketId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  },

  // Fetch supermarket by user ID
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('supermarket')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return null;
    return data;
  },

  // Update supermarket details
 async update(supermarketId, supermarketData) {
  console.log("[update] Updating supermarket:", supermarketId);
  console.log("[update] Data to update:", supermarketData);

  const { data, error } = await supabase
    .from('supermarket')
    .update({
      supermarket_name: supermarketData.supermarketName,
      phone: supermarketData.phone,
      location: supermarketData.location,
      updated_at: new Date().toISOString(),
    })
    .eq('supermarket_id', supermarketId)
    .select()
    .single();

  if (error) {
    console.error("[update] Error updating supermarket:", error);
    throw new Error('Error updating supermarket.');
  }

  console.log("[update] Update successful. Updated data:", data);

  return { success: true, updatedSupermarket: data };
},


  // Fetch supermarket profile including user details
  async getProfileData(userId) {
    const user = await this.getUserById(userId);
    const supermarket = await this.getByUserId(userId);
    return { user, supermarket };
  },

  // Fetch all supermarkets
  async getAll() {
    const { data, error } = await supabase.from('supermarket').select('*');
    if (error) throw new Error('Error fetching supermarkets');
    return data || [];
  },

  // Fetch all suppliers
  async fetchAllSuppliers() {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) throw new Error('Error fetching suppliers');
    return data || [];
  },

  // Fetch all products for a supplier
  async fetchProductsBySupplierId(supplierId) {
    const { data, error } = await supabase
      .from('products')
      .select('product_name')
      .eq('supplier_id', supplierId);

    if (error) throw new Error('Error fetching products');
    return data || [];
  },

  // Get all suppliers with their products
  async getAllSuppliersWithProducts() {
    const suppliers = await this.fetchAllSuppliers();
    const enriched = await Promise.all(
      suppliers.map(async (s) => {
        const products = await this.fetchProductsBySupplierId(s.supplier_id);
        return { ...s, products: products.map((p) => p.product_name) };
      })
    );
    return enriched;
  },

  // Tie-up logic
  async getSupermarketByUserId(userId) {
    return await this.getByUserId(userId);
  },

  async getSupplierById(supplierId) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('supplier_id', supplierId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  },

  async requestTieUp(supermarketUserId, supplierId) {
    const supermarket = await this.getSupermarketByUserId(supermarketUserId);
    const supplier = await this.getSupplierById(supplierId);

    if (!supermarket || !supplier) {
      return {
        error: true,
        statusCode: 404,
        message: 'Supplier or Supermarket not found',
      };
    }

    const { data, error } = await supabase
      .from('tie_up')
      .insert([
        {
          tie_up_id: uuidv4(),
          supplier_id: supplier.supplier_id,
          supplier_user_id: supplier.user_id,
          supermarket_id: supermarket.supermarket_id,
          supermarket_user_id: supermarketUserId,
          status: 'pending',
          requested_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        error: true,
        statusCode: 500,
        message: 'Error saving tie-up request',
        debug: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  },

  async getTieUpStatus(supermarketUserId, supplierId) {
    const { data, error } = await supabase
      .from('tie_up')
      .select('*')
      .eq('supermarket_user_id', supermarketUserId)
      .eq('supplier_id', supplierId)
      .maybeSingle();

    if (error || !data) {
      return {
        error: true,
        statusCode: 404,
        message: 'No tie-up request found',
      };
    }

    return {
      success: true,
      data,
    };
  },

  // Get tie-up status (corrected version, renamed to avoid confusion)
  async getTieUpStatusFromModel(supermarketUserId, supplierId) {
    try {
      const { data, error } = await supabase
        .from("tie_up")
        .select("status")
        .eq("supermarket_user_id", supermarketUserId) // corrected column name here
        .eq("supplier_id", supplierId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          error: true,
          statusCode: 404,
          message: "No tie-up request found",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("❌ Error in getTieUpStatusFromModel:", error.message);
      return {
        error: true,
        statusCode: 500,
        message: "Error retrieving tie-up status",
      };
    }
  },

  // Optionally fetch products linked to a supermarket
  async getProductsBySupermarket(supermarketId) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("supermarket_id", supermarketId);

      if (error) {
        console.error("❌ Error fetching products by supermarket:", error);
        throw new Error("Error fetching products by supermarket");
      }

      return data || [];
    } catch (error) {
      console.error("❌ Unexpected error in getProductsBySupermarket:", error);
      throw new Error("Error fetching products by supermarket");
    }
  },

  // Helper to fetch user from users table
  async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  },

};
