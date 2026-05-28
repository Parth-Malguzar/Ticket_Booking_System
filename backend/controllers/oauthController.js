import { OAuth2Client } from "google-auth-library";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

const googleClient = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

const oauthController = async (req, res) => {
  try {
    const { token,rememberMe } = req.body;
    if (!token) {
      return res
        .status(400)
        .json({ message: "Google sign-in token is required." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;

    if (!email) {
      // just a safety check
      return res
        .status(400)
        .json({ message: "No email found on the Google account." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const rawPassword = crypto.randomBytes(32).toString("hex");
      const saltRounds = Number(process.env.BCRYPT_ROUNDS);
      const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: email === process.env.ADMIN ? "admin" : "user",
      });
    }
    const authToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.cookie("token",authToken,{
      httpOnly:true,//frontend js can't access cookies with dom
      secure:process.env.NODE_ENV==="production",
      sameSite:"strict",
      maxAge:24*60*60*1000//ms equivalent to a day
    })
    return res.status(200).json({
      message: "Signed in with Google successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance:user.balance

      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Google authentication failed. Please try again." });
  }
};
export default oauthController;
