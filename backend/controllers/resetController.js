import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { User } from "../models/userModel.js"

const resetController = async(req,res) => {
    const {token,password}=req.body
    try {
     const decoded = jwt.verify(
       token,
       process.env.JWT_SECRET
     );
     const user=await User.findOne({_id:decoded.userId})
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const saltRounds = Number(process.env.BCRYPT_ROUNDS);
    const hashPass=await bcrypt.hash(password,saltRounds)
     user.password=hashPass
     await user.save()
      return res.status(200).json({
      message: "Password reset successful",
    });
 } catch (error) {
    return res.status(500).json({
      message: "Invalid or expired token",
    });
 }
}
export default resetController