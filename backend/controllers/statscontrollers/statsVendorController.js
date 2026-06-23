import jwt from "jsonwebtoken";
import { CatalogItem } from "../../models/catalogItemModel.js";

const statsVendorController = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "vendor") {
      return res.status(403).json({ message: "Vendor access required" });
    }

    const vendorId = decoded.userId;

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
