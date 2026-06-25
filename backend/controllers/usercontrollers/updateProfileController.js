import { User } from "../../models/userModel.js";
import bcrypt from "bcrypt";

export const updateProfileController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, profilePic, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update profile pic if provided
    if (profilePic !== undefined) {
      user.profilePic = profilePic;
    }

    // Update password if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }

      const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
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
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};
