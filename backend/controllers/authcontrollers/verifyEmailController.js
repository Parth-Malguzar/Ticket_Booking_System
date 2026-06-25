import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";

const verifyEmailController = async (req, res) => {
  try {
    //verify email page will make a post req with token after clicking verify button only
    const token = req.body.token;
    if (!token) {
      return res
        .status(400)
        .json({ message: "Verification token is required" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res
        .status(200)
        .json({ status: "already", message: "Email already verified" });
    }

    user.verified = true;
    await user.save();

    // If user is a vendor and not yet approved by admin, don't auto-login.
    if (user.role === "vendor" && user.vendorStatus !== "approved") {
      return res.status(200).json({
        status: "vendor-pending",
        message: "Email verified. Vendor awaiting admin approval.",
      });
    }

    return res.status(200).json({
      status: "ok",
      message: "Email verification successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        vendorStatus: user.vendorStatus,
        verified: user.verified,
        profilePic: user.profilePic || "",
      },
    });
  } catch (error) {
    console.error("verify email error:", error);
    return res
      .status(400)
      .json({ message: "Invalid or expired verification token" });
  }
};

export default verifyEmailController;
