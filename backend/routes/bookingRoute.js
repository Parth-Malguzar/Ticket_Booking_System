import { Router } from "express";
import { bookEventController } from "../controllers/bookingcontrollers/bookEventController.js";

const router = Router();
router.post("/",bookEventController);
export { router as bookingRoute };
