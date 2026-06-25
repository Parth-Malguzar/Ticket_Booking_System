import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";

const meController = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId }).select(
      "name email role balance vendorStatus profilePic",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: user.balance,
          vendorStatus: user.vendorStatus,
          profilePic: user.profilePic || "",
        },
      });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default meController;
