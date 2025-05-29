import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

export const OrderModel = {

  async findByorderId(orderId) {
    console.log("OrderModel.findByorderId called with:", orderId);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error) {
        console.error("Supabase select error:", error);
        return null;
      }

      console.log("Order found:", data);
      return data;
    } catch (err) {
      console.error("Exception in OrderModel.findByorderId:", err);
      return null;
    }
  },

  async listBySupermarket(supermarketId) {
    console.log("OrderModel.listBySupermarket called with:", supermarketId);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("supermarket_id", supermarketId);

      if (error) {
        console.error("Supabase select error:", error);
        return [];
      }

      console.log(`Found ${data.length} orders for supermarketId ${supermarketId}`);
      return data;
    } catch (err) {
      console.error("Exception in OrderModel.listBySupermarket:", err);
      return [];
    }
  },

  async update(orderId, updateData) {
    console.log("OrderModel.update called with:", orderId, updateData);
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      if (error) {
        console.error("Supabase update error:", error);
        return { success: false, error };
      }

      console.log("Order updated successfully:", orderId);
      return { success: true };
    } catch (err) {
      console.error("Exception in OrderModel.update:", err);
      return { success: false, error: err };
    }
  },


  
}; 

// ---------------------------------------------------------------------------------------------------------------------------------

//order request send details for supermarket

export const getProductsBySupermarketIdService = async (supermarketId) => {
  console.log("Service received supermarketId:", supermarketId);

  // Step 1: Fetch tie-ups
  const { data: tieUps, error: tieUpError } = await supabase
    .from("tie_up")
    .select("supplier_user_id, supermarket_user_id, status")
    .eq("supermarket_id", supermarketId)
    .eq("status", "accepted");

  if (tieUpError) {
    console.error("❌ Error fetching tie-ups:", tieUpError);
    throw new Error("Failed to fetch tie-ups");
  }

  console.log("✅ Tie-ups fetched:", tieUps);

  if (!tieUps || tieUps.length === 0) {
    console.warn("⚠️ No tie-ups found for this supermarket.");
    throw new Error("No tie-ups found for this supermarket.");
  }

  // Step 2: Extract supplier_user_ids
  const supplierIds = tieUps.map(t => t.supplier_user_id);
  console.log("🆔 Accepted supplier IDs (supplier_user_id):", supplierIds);

  // Step 3: Fetch products for these suppliers
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("*")
    .in("supplier_id", supplierIds); // products.supplier_id === tie_up.supplier_user_id

  if (productError) {
    console.error("❌ Error fetching products:", productError);
    throw new Error("Error fetching products");
  }

  console.log(`📦 Found ${products.length} products.`);

  // Step 4: Fetch supplier details from suppliers table
  const { data: suppliers, error: supplierError } = await supabase
    .from("suppliers")
    .select("*")
    .in("user_id", supplierIds); // suppliers.user_id === tie_up.supplier_user_id

  if (supplierError) {
    console.error("❌ Error fetching suppliers:", supplierError);
    throw new Error("Failed to fetch supplier details");
  }

  console.log(`👤 Supplier details fetched (${suppliers.length}):`, suppliers);

  // Step 5: Create a map of supplier user_id → supplier object
  const supplierMap = {};
  suppliers.forEach(supplier => {
    supplierMap[supplier.user_id] = supplier;
  });

  // Step 6: Log product with supplier
  console.log("📋 Products with corresponding supplier details:");
  products.forEach(product => {
    const supplier = supplierMap[product.supplier_id];
    console.log("➡️ Product:", product);
    console.log("   👤 Supplier:", supplier);
  });

  // Step 7: Return both
  return {
    products,
    suppliers,
    supplierMap,
  };
};

// order submit for supermarket
export const placeOrderService = async ({
  product_id,
  supermarket_id,
  supplier_id,
  sku,
  order_quantity,
  delivery_date = null,
}) => {
  const order_date = new Date().toISOString().split("T")[0];

  const orderData = {
    product_id,
    supermarket_id,
    supplier_id,
    sku,
    order_quantity,
    order_date,
    order_status: "pending",
    delivery_date,
  };

  const { data, error } = await supabase
    .from("orders")
    .insert([orderData])
    .select(); // ✅ ensure inserted data is returned

  if (error) {
    console.error("❌ Error placing order:", error);
    throw new Error("Failed to place order");
  }

  console.log("✅ Order placed successfully:", data);
  return data[0]; // now this will work
};

// Fetch all orders by supermarket_id with supplier and product details
export const getOrdersBySupermarketIdService = async (supermarketId) => {
 const { data: orders, error } = await supabase
  .from("orders")
  .select(`
    *,
    products (
      product_name,
      stock,
      sku
    ),
    suppliers (
      name,
      email,
      contact,
      user_id
    )
  `)
  .eq("supermarket_id", supermarketId)
  .order("order_date", { ascending: false });

  if (error) {
    console.error("❌ Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }

  return orders;
};


