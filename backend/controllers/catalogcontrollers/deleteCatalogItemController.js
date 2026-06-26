import { CatalogItem } from "../../models/catalogItemModel.js";

const deleteCatalogItemController = async (req, res) => {
  try {
    const actor = req.user;

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

    if (req.io) {
      req.io.to("admin_room").emit("stats_update", {
        type: item.category,
        change: -1,
      });
      req.io.to(`vendor_${item.createdBy}`).emit("catalog_update", {
        itemId: item._id.toString(),
        category: item.category,
        action: "delete",
      });
    }

    return res.status(200).json({
      message: "Listing deleted successfully",
      item: {
        id: item._id.toString(),
        title: item.title,
        category: item.category,
      },
    });
  } catch (error) {
    console.error("deleteCatalogItemController error", error);
    return res.status(500).json({ message: "Failed to delete listing" });
  }
};

export default deleteCatalogItemController;
