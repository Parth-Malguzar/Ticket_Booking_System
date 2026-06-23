import jwt from "jsonwebtoken";
const verifyToken = (req,res) => {
  const {token} = req.params
  try {
    jwt.verify(token,process.env.JWT_SECRET)//sign and verify are not async
    return res.status(200).json({
            message: "Token valid",
        });
  } catch (error) {
        return res.status(400).json({
            message: "Invalid or expired token",
        });
  }

}
export default verifyToken