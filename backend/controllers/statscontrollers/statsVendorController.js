import jwt from "jsonwebtoken";
import { CatalogItem } from "../../models/catalogItemModel.js";

const statsVendorController = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const totalMovies = await CatalogItem.countDocuments({
      createdBy: vendorId,
      category: "movies",
    });

    const totalConcerts = await CatalogItem.countDocuments({
      createdBy: vendorId,
      category: "concert",
    });

    const totalTrains = await CatalogItem.countDocuments({
      createdBy: vendorId,
      category: "train",
    });

    res.status(200).json({
      totalMovies,
      totalConcerts,
      totalTrains
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default statsVendorController;
