import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

const requestCatalogItemRemovalController = async (req, res) => {
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

    if (actor.role !== "vendor") {
      return res.status(403).json({ message: "Only vendors can request listing removal" });
    }

    const { id } = req.params;
    const item = await CatalogItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (item.createdBy.toString() !== actor._id.toString()) {
      return res.status(403).json({ message: "You can only request removal of your own listings" });
    }

    item.requestRemoval = true;
    await item.save();

    return res.status(200).json({
      message: "Removal requested successfully",
      item: {
        id: item._id.toString(),
        title: item.title,
        category: item.category,
        requestRemoval: item.requestRemoval,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to request listing removal" });
  }
};

export default requestCatalogItemRemovalController;
