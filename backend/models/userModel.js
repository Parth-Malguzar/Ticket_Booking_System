import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "vendor"],
      default: "user",
    },
    bookings: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Booking",
      default: [],
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
