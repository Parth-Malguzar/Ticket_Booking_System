import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const deleteController = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const { password } = req.body;
    if (!password)
      return res.status(400).json({ message: "Password is required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await User.findByIdAndDelete(userId);

    //remove cookie will be handled by logout(),controller

    return res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    console.error("deleteController error", error);
    return res.status(500).json({ message: "Failed to delete account" });
  }
};

export default deleteController;
