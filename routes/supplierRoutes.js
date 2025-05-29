import express from "express";
import { createSupplier, getSupplierByUserId, updateSupplier,getSupplierDashboardData,getSupplierTieUps,acceptTieUpBySupplier} from "../controllers/supplierController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
 
router.get("/dashboard", authMiddleware, getSupplierDashboardData);

router.post("/create", authMiddleware, createSupplier);


router.get("/me", authMiddleware, getSupplierByUserId); 
router.get("/tieup-request-details", authMiddleware, getSupplierTieUps); 
router.put('/tieup/accept/:supermarketId/:supplierId', authMiddleware,acceptTieUpBySupplier);

router.put("/:supplierId", authMiddleware, updateSupplier);

export default router;
