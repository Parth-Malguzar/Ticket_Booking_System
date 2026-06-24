import { Router } from "express";
import getVendorRequestsController from "../controllers/vendorcontrollers/getVendorRequestsController.js";
import approveVendorController from "../controllers/vendorcontrollers/approveVendorController.js";
import rejectVendorController from "../controllers/vendorcontrollers/rejectVendorController.js";
import statsVendorController from "../controllers/statscontrollers/statsVendorController.js";

import { protectRoute, requireRole } from "../middlewares/authMiddleware.js";

const router = Router()

router.get("/", protectRoute, requireRole("admin"), getVendorRequestsController);
router.get("/stats", protectRoute, requireRole("vendor"), statsVendorController);
router.patch("/:id/approve", protectRoute, requireRole("admin"), approveVendorController);
router.patch("/:id/reject", protectRoute, requireRole("admin"), rejectVendorController);

export { router as vendorRoute };
