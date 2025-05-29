import { supabase } from "../config/supabaseClient.js";
import {OrderModel,placeOrderService , getProductsBySupermarketIdService,getOrdersBySupermarketIdService } from '../models/Order.js'; // Adjust path as necessary

//get order for suppliers
export const getOrders = async (req, res) => {
  try {
    const { userId, role } = req.user;
    console.log("Fetching orders for:", { userId, role });

    let query;

    if (role === "supplier") {
      query = supabase.from("orders").select("*").eq("supplier_id", userId);
    } else if (role === "supermarket") {
      query = supabase.from("orders").select("*").eq("supermarket_id", userId);
    } else {
      return res.status(403).json({ error: "Unauthorized role" });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log("Orders fetched:", data.length);
    res.status(200).json({ orders: data });
  } catch (err) {
    console.error("Unhandled server error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update order status by order_id
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status } = req.body;

    if (!order_status) {
      return res.status(400).json({ message: "Missing 'order_status' in request body" });
    }

    const updateData = { order_status };

    // If the status is "delivered", also update the delivery_date
    if (order_status === "delivered") {
      updateData.delivery_date = new Date().toISOString(); // ISO string is ideal for PostgreSQL
    }

    const result = await OrderModel.update(orderId, updateData);

    if (result.success) {
      res.status(200).json({ message: "Order updated successfully" });
    } else {
      res.status(500).json({ message: "Error updating order", error: result.error?.message });
    }
  } catch (error) {
    console.error("Exception in updateOrder:", error);
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};


// ---------------------------------------------------------------------------------------------------------------------------------



//order request send details for supermarket
export const getProductsBySupermarketUserId = async (req, res) => {
  try {
    const { supermarketUserId } = req.params;

const products = await getProductsBySupermarketIdService(supermarketUserId);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No accepted tie-ups found for this supermarket." });
    }

    return res.status(200).json({ message: "Products fetched successfully", products });
  } catch (err) {
    console.error("❌ Server Error:", err.message);
    return res.status(500).json({ message: err.message || "Internal server error." });
  }
};

// order submit for supermarket 
export const placeOrderController = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debug: Log incoming request

    const orderData = req.body;

    if (!orderData.supermarket_id) {
      return res.status(400).json({ message: "Supermarket ID is required" });
    }

    const order = await placeOrderService(orderData);

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to place order" });
  }
};


// GET /orders/supermarket/:supermarketId
export const getOrdersBySupermarketUserId = async (req, res) => {
  try {
    const { supermarketId } = req.params;
    console.log(`📥 supermarketId from params: ${supermarketId}`);

    if (!supermarketId) {
      return res.status(400).json({ message: "Supermarket ID is required" });
    }

    const orders = await getOrdersBySupermarketIdService(supermarketId);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this supermarket." });
    }

    res.status(200).json({ message: "Orders fetched successfully", orders });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};




