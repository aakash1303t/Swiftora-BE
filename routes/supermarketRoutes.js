import express from "express";
import {createSupermarket,
  getSupermarketByUserId,
  updateSupermarket,
  deleteSupermarket,
  getAllSuppliers,
  getSupermarketProfile,
  getSupermarketDashboardData,
  requestTieUp,
  getTieUpStatus,
  getacceptTieUpStatus
} from "../controllers/SupermarketController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();



router.post("/", authMiddleware, createSupermarket);
router.get("/dashboard", authMiddleware, getSupermarketDashboardData);
router.get("/profile", authMiddleware, getSupermarketProfile);
router.get("/me", authMiddleware, getSupermarketByUserId);
router.get("/findsupplier", authMiddleware, getAllSuppliers);
router.post("/request-tieup", authMiddleware, requestTieUp);
router.get("/tieup-status", authMiddleware, getTieUpStatus);
router.get("/accepted-status/:supermarketId", authMiddleware, getacceptTieUpStatus);
router.put("/:supermarketId", authMiddleware, updateSupermarket);
router.delete("/:supermarketId", authMiddleware, deleteSupermarket);

export default router;