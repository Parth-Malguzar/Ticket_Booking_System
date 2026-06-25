import { OAuth2Client } from "google-auth-library";
import { User } from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

const googleClient = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

const oauthController = async (req, res) => {
  try {
    const { token, rememberMe } = req.body;
    //token given by google itself
    if (!token) {
      return res
        .status(400)
        .json({ message: "Google sign-in token is required." });
    }
    //we will get a ticket from google if token is correct
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
        verified: true,
      })
     } else if (!user.verified) {
      // Google proves email ownership — mark existing account verified.
      user.verified = true;
      await user.save();
    }
    const authToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      rememberMe ? { expiresIn: "2d" } : {},
    );
    const cookieOptions = {
      httpOnly: true, //frontend js can't access cookies with dom
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    if (rememberMe) {
      cookieOptions.maxAge = 2 * 24 * 60 * 60 * 1000;
    }

    res.cookie("token", authToken, cookieOptions);

    return res.status(200).json({
      message: "Signed in with Google successfully.",
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
    return res
      .status(500)
      .json({ message: "Google authentication failed. Please try again." });
  }
};
export default oauthController;
