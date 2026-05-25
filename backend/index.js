import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { authRoute } from "./routes/authRoute.js";
dotenv.config();
const app = express();
// allow frontend origin and parse JSON bodies
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json()); //without this req.body will be undefined
app.use((req,res,next)=>{//didn't work as of now

   res.setHeader(
      "Cross-Origin-Opener-Policy",
      "same-origin-allow-popups"
   )

   next()
})
app.use("/api/auth", authRoute);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING,{
      dbName:"ticket_db"
   })
  .then(() => {
    console.log(mongoose.connection.name);
    
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
    console.log("connection with mongodb failed", error);
  });
