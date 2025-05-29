import express from "express";
import { updateInventory, getInventory, modifyInventory, removeInventory } from "../controllers/inventoryController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/postinventory", verifyToken, updateInventory);
router.get("/getinventory", verifyToken, getInventory);
router.put("/modify/:id", verifyToken, modifyInventory);
router.delete("/remove/:id", verifyToken, removeInventory);
export default router;
