import { User } from "../../models/userModel.js";
import bcrypt from "bcrypt";

const deleteController = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const userId = req.user._id;

    // Fetch user with password since protectRoute excludes it by default
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await User.findByIdAndDelete(userId);
    

    return res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    console.error("deleteController error", error);
    return res.status(500).json({ message: "Failed to delete account" });
  }
};

export default deleteController;
