import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getUserProfile,
} from "../controllers/userControllers.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/all", verifyToken, getUsers);
router.get("/profile", verifyToken, getUserProfile);

export default router;
