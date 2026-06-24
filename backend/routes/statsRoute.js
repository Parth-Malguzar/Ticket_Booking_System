import { Router } from "express";
import statsAdminController from "../controllers/statscontrollers/statsAdminController.js";
import statsVendorController from "../controllers/statscontrollers/statsVendorController.js";

import { protectRoute, requireRole } from "../middlewares/authMiddleware.js";

const router = Router()

router.get("/admin-dashboard", protectRoute, requireRole("admin"), statsAdminController)
router.get("/vendor-dashboard", protectRoute, requireRole("vendor"), statsVendorController)


export { router as statsRouter }
