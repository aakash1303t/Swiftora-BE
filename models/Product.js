import supabase from "../config/supabaseClient.js";

/**
 * ✅ Add a new product
 */
export const createProduct = async (req, res) => {
    const {
        barcode,
        sku,
        product_name,
        category,
        purchase_price,
        cost_price,
        sales_price,
        mrp_price,
        discount,
        stock,
        unit,
        hsn_no,
        company,
        expiry_date,
    } = req.body;

    if (!barcode || !sku || !product_name) {
        return res.status(400).json({
            success: false,
            message: "Barcode, SKU, and Product Name are required",
        });
    }

    const supplier_id = req.user.userId;
    const product_id = barcode;

    const { error } = await supabase.from("products").insert([
        {
            supplier_id,
            product_id,
            barcode,
            sku,
            product_name,
            category,
            purchase_price,
            cost_price,
            sales_price,
            mrp_price,
            discount,
            stock,
            unit,
            hsn_no,
            company,
            expiry_date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ]);

    if (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }

    return res
        .status(201)
        .json({ success: true, message: "Product created successfully", product_id });
};

/**
 * ✅ Get all products for a specific supplier
 */
export const getProductsBySupplier = async (supplier_id) => {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("supplier_id", supplier_id);

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    return data;
};

/**
 * ✅ Find a product by SKU for a supplier
 */
export const getProductBySku = async (supplier_id, sku) => {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("supplier_id", supplier_id)
        .eq("sku", sku)
        .single();

    if (error) {
        if (error.code !== "PGRST116")
            console.error("Error finding product:", error); // not found
        return null;
    }

    return data;
};

/**
 * ✅ Update product by SKU
 */
export const updateProduct = async (supplier_id, sku, updateData) => {
    const product = await getProductBySku(supplier_id, sku);
    if (!product) {
        return { success: false, message: "Product not found" };
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("supplier_id", supplier_id)
        .eq("sku", sku);

    if (error) {
        console.error("Error updating product:", error);
        return { success: false, message: "Update failed" };
    }

    return { success: true, message: "Product updated successfully" };
};

/**
 * ✅ Delete product by SKU
 */
export const deleteProduct = async (supplier_id, sku) => {
    const product = await getProductBySku(supplier_id, sku);
    if (!product) {
        return { success: false, message: "Product not found" };
    }

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("supplier_id", supplier_id)
        .eq("product_id", product.product_id);

    if (error) {
        console.error("Error deleting product:", error);
        return { success: false, message: "Delete failed" };
    }

    return { success: true, message: "Product deleted successfully" };
};
