import express from "express";
import { 
    addProduct, 
    getProducts, 
    findBySku, 
    updateProduct, 
    deleteProduct ,
    findByBarcode
} from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ Middleware to check if the user is a supplier
 */
const checkSupplierRole = (req, res, next) => {
    if (req.user.role !== "supplier") {
        return res.status(403).json({ message: "Access denied. Only suppliers can perform this action." });
    }
    next();
};

// ✅ Add a new product (Supplier only)
router.post("/add", authMiddleware, checkSupplierRole, addProduct);

// ✅ Get all products for the logged-in supplier (Supplier only)
router.get("/all", authMiddleware, getProducts);

// ✅ Get a specific product by SKU (Supplier only)
router.get("/sku/:sku", authMiddleware, findBySku);

// ✅ Update product by SKU (Supplier only)
router.put("/update/:sku", authMiddleware, checkSupplierRole, updateProduct);

// ✅ Delete product by SKU (Supplier only)
router.delete("/delete/:sku", authMiddleware, checkSupplierRole, deleteProduct);

// ✅ Get product by barcode
router.get("/scan/:barcode", authMiddleware, findByBarcode);

export default router;
