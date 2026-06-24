import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";

const rejectVendorController = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await User.findById(id);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor request not found" });
    }

    vendor.vendorStatus = "rejected";
    await vendor.save();

    return res.status(200).json({
      message: "Vendor rejected successfully",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        vendorStatus: vendor.vendorStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject vendor" });
  }
};

export default rejectVendorController;
