import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
dotenv.config();
const app = express();
app.use(cors()); //cors policy don't allow communication btw frontend and backend without this
app.use(express.json()); //without this req.body will be undefined


mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    const port = process.env.PORT;

app.get("/", (req, res) => {
  res.status(200).send("Backend is running");
});
    console.log("connected to mongodb");
    app.listen(port, () => {
      console.log("connected to port " + port);
    });
  })
  .catch((error) => {
    console.log("connection with mongodb failded", error);
  });
