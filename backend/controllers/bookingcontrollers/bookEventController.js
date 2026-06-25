import mongoose from "mongoose";
import { User } from "../../models/userModel.js";
import { Booking } from "../../models/bookingModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

export const bookEventController = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const actor = req.user;

    const { itemId, date, time, seats, source, destination } = req.body;

    if (!itemId || !date || !time || !seats) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Missing required booking details" });
    }

    const seatsToBook = Number(seats);

    if (seatsToBook <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Invalid number of seats" });
    }

    // Atomically reduce available seats
    const item = await CatalogItem.findOneAndUpdate(
      {
        _id: itemId,
        availableSeats: { $gte: seatsToBook },
      },
      {
        $inc: { availableSeats: -seatsToBook },//done by mongodb, no read calculate write , no race condition
      },
      {
        new: true,//will return updated item
        session,//every operation with this is part of same transaction if one fails complete rollback happens
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

    const booking = await Booking.create(
      [
        {
          user: updatedUser._id,
          item: item._id,
          seats: seatsToBook,
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