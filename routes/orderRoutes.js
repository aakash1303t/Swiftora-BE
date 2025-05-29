import express from "express";
import { getOrders,updateOrder,placeOrderController,getProductsBySupermarketUserId,getOrdersBySupermarketUserId } from "../controllers/orderController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/getorder", verifyToken, getOrders);
router.put("/update/:orderId", verifyToken, updateOrder);


router.post("/placeorder", verifyToken,placeOrderController);
router.get("/by-supermarket/:supermarketUserId", verifyToken, getProductsBySupermarketUserId);
router.get("/supermarket/:supermarketId", getOrdersBySupermarketUserId);
export default router;
