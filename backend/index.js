import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRoute } from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import { userRoute } from "./routes/userRoute.js";
import { catRoute } from "./routes/catRoute.js";
import { vendorRoute } from "./routes/vendorRoute.js";
import { bookingRoute } from "./routes/bookingRoute.js";
const app = express();
// allow frontend origin and parse JSON bodies
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,//imp for cookie transmission (allow it in frontend also, in axios)
  }),
);
app.use(express.json({ limit: "10mb" })); //without this req.body will be undefined, limit for uploading profile pic
app.use(cookieParser())//to read cookies req.cookies.token
app.use((req,res,next)=>{//didn't work as of now

   res.setHeader(
      "Cross-Origin-Opener-Policy",
      "same-origin-allow-popups"
   )

   next()
})
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/vendors", vendorRoute);
app.use("/api/catalog", catRoute);
app.use("/api/bookings",bookingRoute)


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
