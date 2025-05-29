// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the JWT using the secret key
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object with consistent camelCase
    req.user = {
      userId: payload.userId || payload.user_id,
      username: payload.username,
      role: payload.role,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or Expired Token" });
  }
};

export default authMiddleware;
