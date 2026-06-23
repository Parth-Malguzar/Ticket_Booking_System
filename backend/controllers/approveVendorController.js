import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const approveVendorController = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const vendor = await User.findById(id);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor request not found" });
    }

    vendor.vendorStatus = "approved";
    await vendor.save();

    return res.status(200).json({
      message: "Vendor approved successfully",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        vendorStatus: vendor.vendorStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve vendor" });
  }
};

export default approveVendorController;
