import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";

const getUsersController = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};

    if (role === "user" || role === "vendor") {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("name email role vendorStatus verified balance createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        vendorStatus: user.vendorStatus,
        verified: user.verified,
        balance: user.balance,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load users" });
  }
};

export default getUsersController;
