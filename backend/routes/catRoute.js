import { Router } from "express";
import getCatalogController from "../controllers/catalogcontrollers/getCatalogController.js";
import createCatalogItemController from "../controllers/catalogcontrollers/createCatalogItemController.js";
import getVendorCatalogItemsController from "../controllers/catalogcontrollers/getVendorCatalogItemsController.js";
import deleteCatalogItemController from "../controllers/catalogcontrollers/deleteCatalogItemController.js";
import requestCatalogItemRemovalController from "../controllers/catalogcontrollers/requestCatalogItemRemovalController.js";
import rejectCatalogItemRemovalController from "../controllers/catalogcontrollers/rejectCatalogItemRemovalController.js";
import getCatalogItemController from "../controllers/catalogcontrollers/getCatalogItemController.js";

const router = Router();
router.post("/", createCatalogItemController);
router.get("/", getVendorCatalogItemsController);
router.delete("/:id", deleteCatalogItemController);

// Handle item details by ID, passing to category catalog if the param is a known category
router.get("/:id", (req, res, next) => {
  if (["movies", "train", "concert"].includes(req.params.id?.toLowerCase())) {
    return next();
  }
  return getCatalogItemController(req, res, next);
});

router.get("/:category", getCatalogController);
router.patch("/:id/request-removal", requestCatalogItemRemovalController);
router.patch("/:id/reject-removal", rejectCatalogItemRemovalController);

export {router as catRoute}