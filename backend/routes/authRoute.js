import { Router } from "express";
import oauthController from "../controllers/oauthController.js";
import loginController from "../controllers/loginController.js";
import signupController from "../controllers/signupController.js";
import forgotController from "../controllers/forgotController.js";
import resetController from "../controllers/resetController.js";
import verifyToken from "../controllers/verifyToken.js";
import logoutController from "../controllers/logoutController.js";
import meController from "../controllers/meController.js";
import deleteController from "../controllers/deleteController.js";
const router=Router()
router.post("/google",oauthController)
router.post("/login",loginController)
router.post("/signup",signupController)
router.post("/forgot-password",forgotController)
router.post("/reset-password",resetController)
router.get("/verify-reset-token/:token",verifyToken)
router.get("/me",meController)
router.post("/logout",logoutController)
router.delete("/delete",deleteController)
export {router as authRoute}