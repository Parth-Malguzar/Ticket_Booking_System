import mongoose from "mongoose";
import { User } from "../../models/userModel.js";
import { Booking } from "../../models/bookingModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

export const bookEventController = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const actor = req.user;

    const { itemId, date, time, seats, seatNumbers, source, destination } = req.body;

    let seatsToBook = Number(seats);
    let finalSeatNumbers = seatNumbers || [];

    if (Array.isArray(seatNumbers) && seatNumbers.length > 0) {
      seatsToBook = seatNumbers.length;
      finalSeatNumbers = seatNumbers;
    }

    if (!itemId || !date || !time || !seatsToBook) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Missing required booking details" });
    }

    if (seatsToBook <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Invalid number of seats" });
    }

    // Check for double booking of specific seat numbers
    if (finalSeatNumbers.length > 0) {
      const activeBookings = await Booking.find({ item: itemId, status: { $ne: "cancelled" } }).session(session);
      const occupiedSeats = activeBookings.flatMap(b => b.seatNumbers || []);
      const alreadyBooked = finalSeatNumbers.filter(s => occupiedSeats.includes(s));
      if (alreadyBooked.length > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Seats ${alreadyBooked.join(", ")} are already booked` });
      }
    }

    // Atomically reduce available seats
    const item = await CatalogItem.findOneAndUpdate(
      {
        _id: itemId,
        availableSeats: { $gte: seatsToBook },
      },
      {
        $inc: { availableSeats: -seatsToBook },
      },
      {
        new: true,
        session,
      }
    );

    if (!item) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Not enough seats available",
      });
    }

    const totalAmount = Number(item.price || 0) * seatsToBook;

    // Atomically deduct balance
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: actor._id,
        balance: { $gte: totalAmount },
      },
      {
        $inc: { balance: -totalAmount },
      },
      {
        new: true,
        session,
      }
    );

    if (!updatedUser) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "Not enough balance",
      });
    }

    // Atomically credit vendor balance
    const updatedVendor = await User.findOneAndUpdate(
      {
        _id: item.createdBy,
      },
      {
        $inc: { balance: totalAmount },
      },
      {
        new: true,
        session,
      }
    );

    if (!updatedVendor) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Vendor account not found",
      });
    }

    const booking = await Booking.create(
      [
        {
          user: updatedUser._id,
          item: item._id,
          seats: seatsToBook,
          seatNumbers: finalSeatNumbers,
          date,
          time,
          totalAmount,
          source: item.category === "train" ? source : undefined,
          destination:
            item.category === "train" ? destination : undefined,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Send real-time update to the vendor
    if (req.io) {
      req.io.to(`vendor_${item.createdBy}`).emit("stats_update", {
        category: item.category,
        amount: totalAmount,
        seats: seatsToBook,
        type: "booking"
      });

      // Get updated list of occupied seats
      const activeBookingsAfter = await Booking.find({ item: item._id, status: { $ne: "cancelled" } });
      const occupiedSeatsAfter = activeBookingsAfter.flatMap(b => b.seatNumbers || []);

      req.io.to(`item_${item._id}`).emit("seats_update", {
        itemId: item._id.toString(),
        availableSeats: item.availableSeats,
        occupiedSeats: occupiedSeatsAfter
      });
    }

    return res.status(201).json({
      message: "Ticket booked successfully",
      booking: booking[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Booking error:", error);

    return res.status(500).json({
      message: "Failed to create booking",
    });
  }
};