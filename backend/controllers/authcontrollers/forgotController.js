import { User } from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../services/email.js";
const forgotController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const resetToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "5m",
      },
    );
    const frontendOrigin = process.env.FRONTEND_ORIGIN;
    const resetLink = `${frontendOrigin}/reset-password/${encodeURIComponent(resetToken)}`;

    await sendEmail({
      to: user.email,
      subject: "Reset BookMyTicket's Password",
      text: resetLink,
    });

    return res.status(200).json({ message: "link sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to send reset link" });
  }
};
export default forgotController;
