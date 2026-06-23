import { Router } from "express";
import getCatalogController from "../controllers/catalogcontrollers/getCatalogController.js";
import createCatalogItemController from "../controllers/catalogcontrollers/createCatalogItemController.js";
import getVendorCatalogItemsController from "../controllers/catalogcontrollers/getVendorCatalogItemsController.js";
import deleteCatalogItemController from "../controllers/catalogcontrollers/deleteCatalogItemController.js";
import requestCatalogItemRemovalController from "../controllers/catalogcontrollers/requestCatalogItemRemovalController.js";
import rejectCatalogItemRemovalController from "../controllers/catalogcontrollers/rejectCatalogItemRemovalController.js";

const router = Router();
router.get("/:category", getCatalogController);
router.post("/", createCatalogItemController);
router.get("/", getVendorCatalogItemsController);
router.delete("/:id", deleteCatalogItemController);
router.patch("/:id/request-removal", requestCatalogItemRemovalController);
router.patch("/:id/reject-removal", rejectCatalogItemRemovalController);

export {router as catRoute}