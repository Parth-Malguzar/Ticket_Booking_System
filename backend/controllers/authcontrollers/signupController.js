import { User } from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../../services/email.js";

const signupController = async (req, res) => {
  const { name, email, password, rememberMe, isVendor } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists. Please login." });
    }

    const saltRounds = Number(process.env.BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const role =
      email === process.env.ADMIN ? "admin" : isVendor ? "vendor" : "user";

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      vendorStatus: role === "vendor" ? "pending" : "none",
      verified: role === "admin",
    });

    // generate verification token and send verification email, !! just for remember me to be strictly boolean
    const verifyToken = jwt.sign(
      { userId: user._id, email: user.email, rememberMe: !!rememberMe },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    const frontendOrigin = process.env.FRONTEND_ORIGIN;
    const verifyLink = `${frontendOrigin}/verify-email/${encodeURIComponent(verifyToken)}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your BookMyTicket email",
        text: `Click the link to verify your email: ${verifyLink}`,
      });
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }
    if(req.io){
      req.io.to("admin_room").emit("stats_update",{
        type:user.role,
        change:1,
      })
    }
    // If user is a vendor (pending), let frontend know it's pending verification/approval
    if (isVendor && email !== process.env.ADMIN) {
      return res.status(202).json({
        message:
          "Vendor request submitted for approval. Verification email sent.",
        pending: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorStatus: user.vendorStatus,
          verified: user.verified,
          profilePic: user.profilePic || "",
        },
      });
    }

    // For regular users, require email verification before login
    return res.status(201).json({
      message:
        "Account created. A verification email has been sent. Please verify before logging in.",
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
    console.error("signup error:", error);
    return res.status(500).json({ message: "authentication failed" });
  }
};
export default signupController;
