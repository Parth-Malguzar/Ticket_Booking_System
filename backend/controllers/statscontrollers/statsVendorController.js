import jwt from "jsonwebtoken";
import { CatalogItem } from "../../models/catalogItemModel.js";
import { Booking } from "../../models/bookingModel.js";

const statsVendorController = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // 1. Fetch all catalog items created by this vendor
    const items = await CatalogItem.find({ createdBy: vendorId });
    const itemIds = items.map(item => item._id);

    // 2. Count listings by category
    const totalMovies = items.filter(item => item.category === "movies").length;
    const totalConcerts = items.filter(item => item.category === "concert").length;
    const totalTrains = items.filter(item => item.category === "train").length;

    // 3. Fetch all active (non-cancelled) bookings for these items
    const activeBookings = await Booking.find({
      item: { $in: itemIds },
      status: { $ne: "cancelled" }
    });

    // 4. Calculate earnings by category
    const categoryMap = {};
    items.forEach(item => {
      categoryMap[item._id.toString()] = item.category;
    });

    let movieEarnings = 0;
    let concertEarnings = 0;
    let trainEarnings = 0;

    activeBookings.forEach(booking => {
      const category = categoryMap[booking.item.toString()];
      if (category === "movies") {
        movieEarnings += booking.totalAmount;
      } else if (category === "concert") {
        concertEarnings += booking.totalAmount;
      } else if (category === "train") {
        trainEarnings += booking.totalAmount;
      }
    });

    return res.status(200).json({
      totalMovies,
      totalConcerts,
      totalTrains,
      movieEarnings,
      concertEarnings,
      trainEarnings
    });
  } catch (error) {
    console.error("Stats calculation error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default statsVendorController;
