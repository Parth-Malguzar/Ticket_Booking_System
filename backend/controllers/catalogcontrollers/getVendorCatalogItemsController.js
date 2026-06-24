import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

const getVendorCatalogItemsController = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "vendor") {
      return res.status(403).json({ message: "Vendor access required" });
    }

    const vendor = await User.findById(decoded.userId);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const filter = { createdBy: vendor._id };
    const { category } = req.query;
    //query passed with get req
    //api.get("/auth/catalog-items", {
    //params: { category }
    //});
    //Axios converts this into:
    ///auth/catalog-items?category=movies

    if (
      category === "movies" ||
      category === "train" ||
      category === "concert"
    ) {
      filter.category = category;
    }

    const items = await CatalogItem.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      items: items.map((item) => ({
        id: item._id.toString(),
        category: item.category,
        title: item.title,
        image: item.image,
        date: item.date,
        time: item.time,
        venue: item.venue,
        price: item.price,
        availableSeats: item.availableSeats,
        details: item.details,
        status: item.status,
        createdAt: item.createdAt,
        requestRemoval: item.requestRemoval || false,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load vendor listings" });
  }
};

export default getVendorCatalogItemsController;
