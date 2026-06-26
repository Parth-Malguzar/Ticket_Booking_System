import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogItem",
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
    seatNumbers: {
      type: [Number],
      default: [],
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: false,
    },
    destination: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
    hiddenByUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Booking = mongoose.model("Booking", bookingSchema);
