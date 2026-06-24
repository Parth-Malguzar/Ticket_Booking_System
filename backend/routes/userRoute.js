import { Router } from "express";

import deleteUserController from "../controllers/usercontrollers/deleteUserController.js";
import getUsersController from "../controllers/usercontrollers/getUsersController.js";

import { protectRoute, requireRole } from "../middlewares/authMiddleware.js";
import { getUserBookingsController } from "../controllers/usercontrollers/getUserBookingsController.js";

const router = Router();

router.get("/", protectRoute, requireRole("admin"), getUsersController);
router.delete("/:id", protectRoute, requireRole("admin"), deleteUserController);
router.get("/bookings",protectRoute,requireRole("user"),getUserBookingsController)
export { router as userRoute };
