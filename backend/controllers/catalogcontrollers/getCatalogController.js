import { CatalogItem } from "../../models/catalogItemModel.js";

const getCatalogController = async (req, res) => {
  try {
    const category = String(req.params.category || "").toLowerCase();

    const allowedCategories = ["movies", "train", "concert"];

    if (!allowedCategories.includes(category)) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const items = await CatalogItem.find({
      category,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .lean();//this will remove additional features of mongoose which will save memory because we are just reading and sending data

    return res.status(200).json({
      category,
      items: items.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        image: item.image,
        venue: item.venue,
        price: item.price,
        availableSeats: item.availableSeats,
        details: item.details || [],
        requestRemoval: item.requestRemoval || false,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load catalog",
    });
  }
};

export default getCatalogController;