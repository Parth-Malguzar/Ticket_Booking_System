import { User } from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const loginController = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please sign up.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }
    if (!user.verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }
    if (user.role === "vendor" && user.vendorStatus !== "approved") {
      return res.status(403).json({
        message:
          user.vendorStatus === "rejected"
            ? "Vendor request was rejected by admin."
            : "Vendor account is pending approval.",
      });
    }
    const jwtOptions = rememberMe ? { expiresIn: "2d" } : {};
    const authToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      jwtOptions,
    );
    //previously we were using localstorage now we will use cookies which is automatic
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",//we can't use strict here because we are opening our website from external links sent in emails for auth for that lax is best
      
      path: "/", //With path: "/", the auth cookie is available everywhere in the backend as long as the request matches the domain/origin rules.
    };

    if (rememberMe) {
      cookieOptions.maxAge = 2 * 24 * 60 * 60 * 1000;
    }
    //making cookie //name content security
    res.cookie("token", authToken, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      //don't pass token here
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        vendorStatus: user.vendorStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while logging in.",
    });
  }
};
export default loginController;
