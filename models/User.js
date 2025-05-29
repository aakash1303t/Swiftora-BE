// models/User.js
import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
export const User = {
  // 1. Create a new user
  async create({ username, email, password, role }) {
    const normalizedRole     = role.toLowerCase();
    const normalizedUsername = username.toLowerCase();
    const normalizedEmail    = email.toLowerCase();
    const allowedRoles       = ["supplier", "supermarket"];

    if (!allowedRoles.includes(normalizedRole)) {
      throw new Error("Invalid role. Only 'supplier' or 'supermarket' allowed.");
    }

    // Check for existing username or email
    const { data: existing, error: existErr } = await supabase
      .from("users")
      .select("user_id")
      .or(
        `username.eq.${normalizedUsername},email.eq.${normalizedEmail}`
      );
    if (existErr) throw existErr;
    if (existing.length > 0) {
      throw new Error("Username or email already taken.");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Insert new user (note snake_case column names)
    const newRecord = {
      user_id:       uuidv4(),
      username:      normalizedUsername,
      email:         normalizedEmail,
      password_hash: hashedPassword,        // assume you've already hashed it
      role:          normalizedRole,
    };

    const { data, error } = await supabase
      .from("users")
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      console.error("Error inserting user:", error);
      throw new Error("Database Error: Unable to create user.");
    }

    return { success: true, userId: data.user_id };
  },

  // 2. Find a user by username
  async findByUsername(username) {
    const normalized = username.toLowerCase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", normalized)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error finding user by username:", error);
      throw error;
    }
    return data || null;
  },

  // 3. Get a user by their ID
  async getById(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error getting user by id:", error);
      throw error;
    }
    return data || null;
  },
};
