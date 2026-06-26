import { CatalogItem } from "../../models/catalogItemModel.js";

const rejectCatalogItemRemovalController = async (req, res) => {
  try {
    const actor = req.user;

    if (actor.role !== "admin") {
      return res.status(403).json({ message: "Only admins can reject removal requests" });
    }

    const { id } = req.params;
    let item = await CatalogItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Listing not found" });
    }

    item = await CatalogItem.findByIdAndUpdate(
      id,
      { requestRemoval: false },
      { new: true }
    );

    if (req.io) {
      req.io.to("admin_room").emit("stats_update");
    }

    return res.status(200).json({
      message: "Removal request rejected successfully",
      item: {
        id: item._id.toString(),
        title: item.title,
        category: item.category,
        requestRemoval: item.requestRemoval,
      },
    });
  } catch (error) {
    console.error("Reject removal error:", error);
    return res.status(500).json({ message: "Failed to reject removal request" });
  }
};

export default rejectCatalogItemRemovalController;
