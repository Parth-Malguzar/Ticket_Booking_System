import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

const deleteCatalogItemController = async (req, res) => {
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

    if (actor.role !== "admin" && actor.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const item = await CatalogItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (
      actor.role === "vendor" &&
      item.createdBy.toString() !== actor._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own listings" });
    }

    await CatalogItem.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Listing deleted successfully",
      item: {
        id: item._id.toString(),
        title: item.title,
        category: item.category,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete listing" });
  }
};

export default deleteCatalogItemController;
