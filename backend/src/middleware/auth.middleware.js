import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "baatcheet_default_secret_key";

export const protectRoute = async (req, res, next) => {
  try {
    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.userId) {
          const user = await User.findById(decoded.userId).select("-password");
          if (user) {
            req.user = user;
            return next();
          }
        }
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError.message);
      }
    }

    // 2. Fallback to Passport session
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    return res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

