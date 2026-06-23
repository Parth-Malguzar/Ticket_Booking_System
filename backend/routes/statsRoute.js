import { Router } from "express";
import statsAdminController from "../controllers/statscontrollers/statsAdminController.js";
import statsVendorController from "../controllers/statscontrollers/statsVendorController.js";

const router = Router()

router.get("/admin-dashboard", statsAdminController)
router.get("/vendor-dashboard", statsVendorController)


export { router as statsRouter }
