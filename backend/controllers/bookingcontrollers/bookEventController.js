import mongoose from "mongoose";
import { User } from "../../models/userModel.js";
import { Booking } from "../../models/bookingModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

import { generateQRCode } from "../../services/qr.js";
import { generateTicketPDF } from "../../services/pdf.js";
import { sendTicketEmail } from "../../services/email.js";


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
      //flat map to convert 2d to 1d array
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
        returnDocument: "after",
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
        returnDocument: "after",
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
        returnDocument: "after",
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
        availableSeats: item.availableSeats,//available seats no.
        occupiedSeats: occupiedSeatsAfter//occupied seats array
      });
    }


    try {
      const qrBuffer = await generateQRCode(booking[0]._id.toString());

      const pdfBuffer = await generateTicketPDF(
        {
          _id: booking[0]._id,
          movieTitle: item.title,
          showDate: booking[0].date,
          showTime: booking[0].time,
          venue: item.venue,
          seatNumbers: booking[0].seatNumbers,
          totalAmount: booking[0].totalAmount,
          category: item.category,
          source: booking[0].source,
          destination: booking[0].destination,
        },
        qrBuffer
      );

      await sendTicketEmail(updatedUser.email, pdfBuffer);
    } catch (emailError) {
      console.error("Failed to generate ticket PDF or send email:", emailError);
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