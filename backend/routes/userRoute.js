import { Router } from "express";

import deleteUserController from "../controllers/usercontrollers/deleteUserController.js";
import getUsersController from "../controllers/usercontrollers/getUsersController.js";

import { protectRoute, requireRole } from "../middlewares/authMiddleware.js";
import { getUserBookingsController } from "../controllers/usercontrollers/getUserBookingsController.js";
import { updateProfileController } from "../controllers/usercontrollers/updateProfileController.js";

const router = Router();

router.get("/", protectRoute, requireRole("admin"), getUsersController);
router.delete("/:id", protectRoute, requireRole("admin"), deleteUserController);
router.get("/bookings",protectRoute,getUserBookingsController)
router.put("/profile", protectRoute, updateProfileController);
export { router as userRoute };
