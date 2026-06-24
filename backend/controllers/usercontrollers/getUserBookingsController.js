import { Booking } from "../../models/bookingModel.js";

export const getUserBookingsController = async (req, res) => {
  try {
    const user = req.user;

    // Fetch user bookings and populate the referenced CatalogItem
    const bookings = await Booking.find({ user: user._id })
      .populate("item")
      .sort({ createdAt: -1 });

    // Format output matching the frontend UserBooking schema
    const formattedBookings = bookings.map((b) => {
      const item = b.item || {};
      return {
        id: b._id.toString(),
        userId: b.user.toString(),
        itemId: item._id?.toString() || "",
        title: item.title || "Unknown Listing",
        image: item.image || "",
        category: item.category || "",
        date: b.date,
        time: b.time,
        seats: b.seats,
        venue: item.venue || "",
        price: item.price || 0,
        totalAmount: b.totalAmount,
        source: b.source,
        destination: b.destination,
        status: b.status,
        createdAt: b.createdAt,
      };
    });

    return res.status(200).json({ bookings: formattedBookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({ message: "Failed to load bookings" });
  }
};