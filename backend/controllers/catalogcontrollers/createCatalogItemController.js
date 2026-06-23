import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

const createCatalogItemController = async (req, res) => {
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

    if (vendor.vendorStatus !== "approved") {
      return res
        .status(403)
        .json({ message: "Vendor approval required before adding listings" });
    }

    const { category, title, image, date, time, venue, price, tag, details } =
      req.body;

    if (
      !category ||
      !title ||
      !image ||
      !date ||
      !time ||
      !venue ||
      !price ||
      !tag
    ) {
      return res
        .status(400)
        .json({ message: "All listing fields are required" });
    }

    const normalizedDetails = Array.isArray(details)
      ? details
      : String(details || "")
          .split(",")
          .map((detail) => detail.trim())
          .filter(Boolean);

    const item = await CatalogItem.create({
      category,
      title,
      image,
      date,
      time,
      venue,
      price,
      tag,
      details: normalizedDetails,
      status: "approved",
      createdBy: vendor._id,
    });

    return res.status(201).json({
      message: "Listing created successfully",
      item: {
        id: item._id.toString(),
        category: item.category,
        title: item.title,
        image: item.image,
        date: item.date,
        time: item.time,
        venue: item.venue,
        price: item.price,
        tag: item.tag,
        details: item.details,
        status: item.status,
        createdBy: item.createdBy,
        createdAt: item.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create listing" });
  }
};

export default createCatalogItemController;
