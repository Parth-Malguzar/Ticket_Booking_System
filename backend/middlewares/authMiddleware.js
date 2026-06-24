import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

// 1. Authenticate user token
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user information to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 2. Authorize roles (e.g. requireAdmin, requireVendor)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Unauthorized role" });
    }
    next();
  };
};

// 3. Specifically verify approved vendors
export const requireApprovedVendor = (req, res, next) => {
  if (req.user.role !== "vendor" || req.user.vendorStatus !== "approved") {
    return res.status(403).json({ message: "Approved vendor access required" });
  }
  next();
};
