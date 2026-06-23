import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";

const getVendorRequestsController = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const vendors = await User.find({
      role: "vendor",
      vendorStatus: "pending",
    })
      .select("name email role vendorStatus createdAt")
      .sort({ createdAt: -1 });

    const requests = vendors.map((vendor) => ({
      id: vendor._id.toString(),
      name: vendor.name,
      email: vendor.email,
      role: vendor.role,
      vendorStatus: vendor.vendorStatus,
      createdAt: vendor.createdAt,
    }));

    return res.status(200).json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load vendor requests" });
  }
};

export default getVendorRequestsController;
