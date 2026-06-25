import mongoose from "mongoose";
import { User } from "../../models/userModel.js";
import { Booking } from "../../models/bookingModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

export const updateEventController = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const actor = req.user;
        const { bookingId, date, time, seats, source, destination } = req.body;

        if (!bookingId || !date || !time || !seats) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Missing required update details" });
        }

        const seatsToBook = Number(seats);
        if (seatsToBook <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Invalid number of seats" });
        }

        // 1. Fetch the existing booking
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Booking not found" });
        }

        // 2. Check ownership
        if (actor._id.toString() !== booking.user.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Not authorized to update this booking" });
        }

        // 3. Ensure booking is not cancelled
        if (booking.status === "cancelled") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Cannot update a cancelled booking" });
        }

        // 4. Fetch the catalog item details
        const itemId = booking.item;
        const item = await CatalogItem.findById(itemId).session(session);
        if (!item) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Associated listing not found" });
        }

        // Calculate differences in seats and amount
        const seatsDiff = seatsToBook - booking.seats;
        const costDiff = seatsDiff * Number(item.price || 0);

        // 5. Atomically update seats in CatalogItem
        // If seatsDiff > 0, we require availableSeats to be >= seatsDiff.
        // If seatsDiff <= 0 (refunding seats), we don't need a minimum check.
        const updatedItem = await CatalogItem.findOneAndUpdate(
            {
                _id: itemId,
                ...(seatsDiff > 0 ? { availableSeats: { $gte: seatsDiff } } : {})
            },
            {
                $inc: { availableSeats: -seatsDiff }
            },
            {
                new: true,
                session
            }
        );

        if (!updatedItem) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Not enough available seats to increase booking" });
        }

        // 6. Atomically update user balance
        // If costDiff > 0, we require balance to be >= costDiff.
        // If costDiff <= 0 (refunding money), no balance check is required.
        const updatedUser = await User.findOneAndUpdate(
            {
                _id: actor._id,
                ...(costDiff > 0 ? { balance: { $gte: costDiff } } : {})
            },
            {
                $inc: { balance: -costDiff }
            },
            {
                new: true,
                session
            }
        );

        if (!updatedUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Insufficient balance to cover booking changes" });
        }

        // 7. Update booking details
        booking.seats = seatsToBook;
        booking.date = date;
        booking.time = time;
        booking.totalAmount = seatsToBook * Number(item.price || 0);
        if (item.category === "train") {
            booking.source = source || booking.source;
            booking.destination = destination || booking.destination;
        }

        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: "Booking updated successfully",
            booking,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        console.error("Booking update error:", error);
        return res.status(500).json({ message: "Failed to update booking" });
    }
};