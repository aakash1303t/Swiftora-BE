import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { Supplier } from "../models/Supplier.js";
import { Supermarket } from "../models/Supermarket.js";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      location,
      supermarketName,
      phone,
    } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      email,
      password, // Store raw password if needed, ideally store password_hash
      role,
    };

    const result = await User.create(newUser);
    if (!result.success) {
      return res.status(500).json({
        message: "Error creating user",
        error: result.error,
      });
    }

    const userId = result.userId;

    // Common location validator
    const getValidatedLocation = () => {
      if (
        location &&
        typeof location.lat === "number" &&
        typeof location.lng === "number"
      ) {
        return {
          lat: location.lat,
          lng: location.lng,
          address: location.address || "Unknown",
        };
      }
      return null;
    };

    // Supplier creation
    if (role.toLowerCase() === "supplier") {
      const supplierData = {
        supplier_id: uuidv4(),
        user_id: userId,
        username,
        email,
        name: "",
        contact: "",
        location: getValidatedLocation(),
      };

      const supplierResult = await Supplier.create(supplierData);
      if (!supplierResult.success) {
        return res.status(500).json({
          message: "Error creating supplier entry",
          error: supplierResult.error,
        });
      }
    }

    // Supermarket creation
    if (role.toLowerCase() === "supermarket") {
      const supermarketData = {
        supermarket_id: uuidv4(),
        user_id: userId,
        username,
        email,
        supermarket_name: supermarketName?.trim() || null, // Optional name
        phone: phone || "",
        location: getValidatedLocation(),
      };

      const supermarketResult = await Supermarket.create(supermarketData);
      if (!supermarketResult.success) {
        return res.status(500).json({
          message: "Error creating supermarket entry",
          error: supermarketResult.error,
        });
      }
    }

    return res.status(201).json({
      message: "User registered successfully",
      user_id: userId,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    let supplierDetails = null;
    if (user.role === "supplier") {
      try {
        const supplier = await Supplier.getByUserId(user.user_id);
        if (supplier) {
          supplierDetails = await Supplier.getById(supplier.supplier_id);
        }
      } catch (error) {
        console.error("Error fetching supplier details:", error);
      }
    }

    let supermarketDetails = null;
    let supermarket_id = null;
    if (user.role === "supermarket") {
      try {
        const supermarket = await Supermarket.getByUserId(user.user_id);
        if (supermarket) {
          supermarketDetails = await Supermarket.getById(supermarket.supermarket_id);
          supermarket_id = supermarket.supermarket_id;
        }
      } catch (error) {
        console.error("Error fetching supermarket details:", error);
      }
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      supplierDetails,
      supermarketDetails,
      supermarket_id,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*"); // 🔁 lowercase table name
    if (error) throw error;

    res.json({ users: data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const user = await User.getById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};
