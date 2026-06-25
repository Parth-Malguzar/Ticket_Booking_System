import { Router } from "express";
import { bookEventController } from "../controllers/bookingcontrollers/bookEventController.js";
import { protectRoute, requireRole } from "../middlewares/authMiddleware.js";
import { updateEventController } from "../controllers/bookingcontrollers/updateEventController.js";
import { deleteEventController } from "../controllers/bookingcontrollers/deleteEventController.js";
import { hideBookingController } from "../controllers/bookingcontrollers/hideBookingController.js";

const router = Router();
router.post("/",protectRoute,requireRole("user"),bookEventController);
router.delete("/",protectRoute,requireRole("user"),deleteEventController)
router.put("/",protectRoute,requireRole("user"),updateEventController)
router.patch("/hide",protectRoute,requireRole("user"),hideBookingController)

export { router as bookingRoute };
