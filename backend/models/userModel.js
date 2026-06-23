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
    vendorStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: Number,
      default: function () {
        return this.role === "user" ? 1000 : 0; //for using this make a function(not an arrow function)
      },
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
