import mongoose from "mongoose";
import { User } from "../../models/userModel.js";
import { Booking } from "../../models/bookingModel.js";
import { CatalogItem } from "../../models/catalogItemModel.js";

export const deleteEventController = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const actor = req.user;
        const { bookingId } = req.body;

        if (!bookingId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Booking ID is required" });
        }

        // 1. Fetch booking with session
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
            return res.status(403).json({ message: "Only the user who booked this ticket can cancel it" });
        }

        // 3. Prevent double-refund exploits
        if (booking.status === "cancelled") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "This booking is already cancelled" });
        }

        const seats = booking.seats;
        const totalAmount = booking.totalAmount;
        const itemId = booking.item; // booking.item is already the ObjectId. booking.item._id would be undefined.

        // 4. Atomically return seats to the catalog item
        const item = await CatalogItem.findOneAndUpdate(
            { _id: itemId },
            { $inc: { availableSeats: seats } },
            { new: true, session }
        );

        if (!item) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Associated listing not found" });
        }

        // 5. Atomically refund the user balance
        const updatedUser = await User.findOneAndUpdate(
            { _id: actor._id },
            { $inc: { balance: totalAmount } },
            { new: true, session }
        );

        if (!updatedUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({ message: "Failed to refund balance" });
        }

        // 6. Update booking status to cancelled
        booking.status = "cancelled";
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: "Ticket cancelled successfully",
            booking,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        console.error("Cancellation error:", error);
        return res.status(500).json({ message: "Failed to cancel booking" });
    }
};