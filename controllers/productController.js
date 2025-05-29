import { supabase } from "../config/supabaseClient.js";

/**
 * ✅ Add a new product
 */
export const addProduct = async (req, res) => {
  try {
    const {
      product_name,
      sku,
      barcode,
      category,
      company,
      cost_price,
      purchase_price,
      sales_price,
      mrp_price,
      discount,
      expiry_date,
      hsn_no,
      stock,
      unit,
    } = req.body;

    const supplier_id = req.user.userId;

    if (!barcode) {
      return res.status(400).json({ success: false, message: "Barcode is required" });
    }

    const now = new Date().toISOString();

    const { error } = await supabase.from("products").insert([
      {
        supplier_id,
        product_id: barcode, // assuming barcode is unique and used as the primary key
        sku: sku?.trim() || `SKU-${barcode}`,
        product_name: product_name?.trim() || "New Product",
        barcode: barcode.trim(),
        category: category?.trim() || "Uncategorized",
        company: company?.trim() || "",
        cost_price: parseFloat(cost_price) || 0,
        purchase_price: parseFloat(purchase_price) || 0,
        sales_price: parseFloat(sales_price) || 0,
        mrp_price: parseFloat(mrp_price) || 0,
        discount: parseFloat(discount) || 0,
        expiry_date: expiry_date || null,
        hsn_no: hsn_no?.trim() || "",
        stock: parseInt(stock) || 0,
        unit: unit?.trim() || "",
        created_at: now,
        updated_at: now,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error.message);
      throw error;
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product_id: barcode,
    });
  } catch (error) {
    console.error("Controller error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error adding product",
      error: error.message,
    });
  }
};



/**
 * ✅ Get all products for a specific supplier
 */
export const getProducts = async (req, res) => {
    try {
        const supplier_id = req.user.userId;

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("supplier_id", supplier_id);

        if (error) throw error;

        res.status(200).json({ products: data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
    }
};

/**
 * ✅ Find product by SKU
 */
export const findBySku = async (req, res) => {
    try {
        const { sku } = req.params;
        const supplier_id = req.user.userId;

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("supplier_id", supplier_id)
            .eq("sku", sku)
            .single();

        if (error) return res.status(404).json({ success: false, message: "Product not found" });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching product", error: error.message });
    }
};

/**
 * ✅ Update product by SKU
 */
export const updateProduct = async (req, res) => {
  try {
    const { sku } = req.params;
    const supplier_id = req.user.userId;

    // Find the product by supplier_id + sku
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("product_id")
      .eq("supplier_id", supplier_id)
      .eq("sku", sku)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Prepare fields to update
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v !== undefined && v !== null)
    );
    updateData.updated_at = new Date();

    // Perform the update
    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("supplier_id", supplier_id)
      .eq("product_id", existingProduct.product_id);

    if (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({ success: false, message: "Update failed", error });
    }

    res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error("Exception in updateProduct:", error);
    res.status(500).json({ success: false, message: "Error updating product", error: error.message });
  }
};



/**
 * ✅ Delete product by SKU
 */
export const deleteProduct = async (req, res) => {
    try {
        const { sku } = req.params;
        const supplier_id = req.user.userId;

        const { data: existingProduct, error: fetchError } = await supabase
            .from("products")
            .select("product_id")
            .eq("supplier_id", supplier_id)
            .eq("sku", sku)
            .single();

        if (fetchError || !existingProduct)
            return res.status(404).json({ success: false, message: "Product not found" });

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("supplier_id", supplier_id)
            .eq("product_id", existingProduct.product_id);

        if (error) throw error;

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting product", error: error.message });
    }
};

/**
 * ✅ Find product by Barcode
 */
export const findByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;
        const supplier_id = req.user.userId;

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("supplier_id", supplier_id)
            .eq("barcode", barcode)
            .single();

        if (error) return res.status(404).json({ success: false, message: "Product not found" });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching product", error: error.message });
    }
};
