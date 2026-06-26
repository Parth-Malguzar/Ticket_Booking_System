import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from 'http';
import { Server } from "socket.io";
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
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_vendor_room", (vendorId) => {
    socket.join(`vendor_${vendorId}`);
    console.log(`Socket ${socket.id} joined room: vendor_${vendorId}`);
  });
  socket.on("join_admin_room",()=> {
    socket.join(`admin_room`);
    console.log(`Socket ${socket.id} joined room: admin_room`);
  });
  socket.on("join_item_room", (itemId) => {
    socket.join(`item_${itemId}`);
    console.log(`Socket ${socket.id} joined room: item_${itemId}`);
  });
  socket.on("leave_item_room", (itemId) => {
    socket.leave(`item_${itemId}`);
    console.log(`Socket ${socket.id} left room: item_${itemId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,//imp for cookie transmission (allow it in frontend also, in axios)
  }),
);
app.use(express.json({ limit: "10mb" })); //without this req.body will be undefined, limit for uploading profile pic
app.use(cookieParser())//to read cookies req.cookies.token
app.use((req, res, next) => {//didn't work as of now

  res.setHeader(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups"
  )

  next()
})

app.use((req, res, next) => {
  req.io = io;
  next();
})

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/vendors", vendorRoute);
app.use("/api/catalog", catRoute);
app.use("/api/bookings", bookingRoute)


mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    dbName: "ticket_db"
  })
  .then(() => {
    console.log(mongoose.connection.name);

    const port = process.env.PORT;
    app.get("/", (req, res) => {
      res.status(200).send("Backend is running");
    });


    console.log("connected to mongodb");
    server.listen(port, () => {//creates a http server
      console.log("connected to port " + port);
    });
  })
  .catch((error) => {
    console.log("connection with mongodb failed", error);
  });
