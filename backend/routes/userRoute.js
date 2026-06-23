import { Router } from "express";

import deleteUserController from "../controllers/usercontrollers/deleteUserController.js";
import getUsersController from "../controllers/usercontrollers/getUsersController.js";

const router = Router();

router.get("/", getUsersController);
router.delete("/:id", deleteUserController);

export { router as userRoute };
