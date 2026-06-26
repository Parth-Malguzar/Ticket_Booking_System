import { Router } from "express";
import oauthController from "../controllers/authcontrollers/oauthController.js";
import loginController from "../controllers/authcontrollers/loginController.js";
import signupController from "../controllers/authcontrollers/signupController.js";
import verifyEmailController from "../controllers/authcontrollers/verifyEmailController.js";
import forgotController from "../controllers/authcontrollers/forgotController.js";
import resetController from "../controllers/authcontrollers/resetController.js";
import verifyToken from "../controllers/authcontrollers/verifyToken.js";
import meController from "../controllers/authcontrollers/meController.js";
import logoutController from "../controllers/authcontrollers/logoutController.js";
import deleteController from "../controllers/authcontrollers/deleteController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = Router();
router.post("/google", oauthController);
router.post("/login", loginController);
router.post("/signup", signupController);
router.post("/verify-email", verifyEmailController);
router.post("/forgot-password", forgotController);
router.post("/reset-password", resetController);
router.get("/verify-reset-token/:token", verifyToken);
router.get("/me", protectRoute, meController);
router.post("/logout", logoutController);
router.delete("/delete", protectRoute, deleteController);

export { router as authRoute };
