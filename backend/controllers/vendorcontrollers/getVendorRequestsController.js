import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";

const getVendorRequestsController = async (req, res) => {
  try {
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
