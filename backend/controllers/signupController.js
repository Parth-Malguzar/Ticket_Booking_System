import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const signupController = async (req, res) => {
    const { name,email,password } = req.body;
  try {

    let user = await User.findOne({ email });
    if(user){
        return res.status(400).json({msg:"user already exist : Please login"})
    }

      const saltRounds = Number(process.env.BCRYPT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: email === process.env.ADMIN ? "admin" : "user",
      });

    const authToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "signup successful",
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res
      .status(500)
      .json({ message: "authentication failed"});
  }
};
export default signupController;
