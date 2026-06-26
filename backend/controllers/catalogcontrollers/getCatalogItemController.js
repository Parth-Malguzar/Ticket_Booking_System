import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

const getCatalogItemController = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const actor = await User.findById(decoded.userId);
    if (!actor) {
      return res.status(404).json({ message: "User not found" });
    }

    const { id } = req.params;
    const item = await CatalogItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Listing not found" });
    }

    return res.status(200).json({
      message: "item sent successfully",
      item: {
        id: item._id.toString(),
        createdBy:item.createdBy.toString(),
        category: item.category,
        title: item.title,
        image: item.image,
        date: item.date,
        time: item.time,
        venue: item.venue,
        price: item.price,
        availableSeats: item.availableSeats,
        details: item.details || [],
        status: item.status,
        requestRemoval: item.requestRemoval || false,
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send item" });
  }
};

export default getCatalogItemController;
