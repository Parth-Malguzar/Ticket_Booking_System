import { Booking } from "../../models/bookingModel.js";

export const hideBookingController = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure only the owner can hide their booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to hide this booking" });
    }

    // Only allow hiding if the status is cancelled
    if (booking.status !== "cancelled") {
      return res.status(400).json({ message: "Only cancelled bookings can be removed from view" });
    }

    booking.hiddenByUser = true;
    await booking.save();

    return res.status(200).json({ message: "Booking removed from view successfully" });
  } catch (error) {
    console.error("Error hiding booking:", error);
    return res.status(500).json({ message: "Failed to remove booking from view" });
  }
};
