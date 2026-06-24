import { Router } from "express";
import { bookEventController } from "../controllers/bookingcontrollers/bookEventController.js";
import { protectRoute, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();
router.post("/",protectRoute,requireRole("user"),bookEventController);
export { router as bookingRoute };
