import { Router } from "express";
import getVendorRequestsController from "../controllers/vendorcontrollers/getVendorRequestsController.js";
import approveVendorController from "../controllers/vendorcontrollers/approveVendorController.js";
import rejectVendorController from "../controllers/vendorcontrollers/rejectVendorController.js";
import statsVendorController from "../controllers/statscontrollers/statsVendorController.js";

const router = Router()

router.get("/", getVendorRequestsController);
router.get("/stats", statsVendorController);
router.patch("/:id/approve", approveVendorController);
router.patch("/:id/reject", rejectVendorController);


export { router as vendorRoute };
