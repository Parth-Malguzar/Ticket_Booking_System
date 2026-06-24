import mongoose from "mongoose";

const catalogItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["movies", "train", "concert"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    availableSeats:{
      type:Number,
      required:true,
    },
    details: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["approved", "pending"],
      default: "approved",
    },
    requestRemoval: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const CatalogItem = mongoose.model("CatalogItem", catalogItemSchema);
