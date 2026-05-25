import { Router } from "express";
import oauthController from "../controllers/oauthController.js";
import loginController from "../controllers/loginController.js";
import signupController from "../controllers/signupController.js";
import forgotController from "../controllers/forgotController.js";
import resetController from "../controllers/resetController.js";
import verifyToken from "../controllers/verifyToken.js";
const router=Router()
router.post("/google",oauthController)
router.post("/login",loginController)
router.post("/signup",signupController)
router.post("/forgot-password",forgotController)
router.post("/reset-password",resetController)
router.get("/verify-reset-token/:token",verifyToken)
export {router as authRoute}