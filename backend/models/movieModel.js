import mongoose from "mongoose";
const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const Movie = mongoose.model("Movie", movieSchema);
