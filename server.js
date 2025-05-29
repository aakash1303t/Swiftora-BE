import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import supermarketRoutes from "./routes/supermarketRoutes.js";
dotenv.config();

// Initialize Supabase Client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/supermarkets", supermarketRoutes);
app.use(express.static(path.join(__dirname, "public")));

// ✅ Health Check Route for Deployment Confirmation
app.get("/", (req, res) => {
  res.json({ message: "Swiftora Backend Successfully Deployed on Vercel!" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(5000, "0.0.0.0", () => console.log("Server running on port 5000"));
export default app;
