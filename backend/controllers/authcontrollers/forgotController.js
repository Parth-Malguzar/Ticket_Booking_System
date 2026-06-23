import { User } from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
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
    //change this link url if deploying
    const resetLink = `http://localhost:5173/reset-password/${encodeURIComponent(resetToken)}`;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "parthmalguzar@gmail.com",
        pass: process.env.APP_PASS,
      },
    });

    let mailOptions = {
      from: "parthmalguzar@gmail.com",
      to: `${user.email}`,
      subject: "Reset BookMyTicket's Password",
      text: resetLink,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "link sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to send reset link" });
  }
};
export default forgotController;
