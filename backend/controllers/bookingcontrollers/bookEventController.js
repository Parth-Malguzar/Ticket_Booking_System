import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";
import { Booking } from "../../models/bookingModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

export const bookEventController = async (req, res) => {
  try {
   
    const actor = await req.user;

    const { itemId, date, time, seats, source, destination } = req.body;
    if (!itemId || !date || !time || !seats) {
      return res.status(400).json({ message: "Missing required booking details" });
    }

    const item = await CatalogItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Catalog listing not found" });
    }

    const seatsToBook = Number(seats);
    if (seatsToBook <= 0) {
      return res.status(400).json({ message: "Invalid number of seats" });
    }

    if (item.availableSeats < seatsToBook) {
      return res.status(400).json({ message: `Only ${item.availableSeats} seats available` });
    }

    const totalAmount = Number(item.price || 0) * seatsToBook;

    // Decrement available seats
    item.availableSeats -= seatsToBook;
    await item.save();

    const booking = await Booking.create({
      user: actor._id,
      item: item._id,
      seats: seatsToBook,
      date,
      time,
      totalAmount,
      source: item.category === "train" ? source : undefined,
      destination: item.category === "train" ? destination : undefined,
    });

    return res.status(201).json({
      message: "Ticket booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ message: "Failed to create booking" });
  }
};
