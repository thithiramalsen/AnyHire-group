import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import { createServer } from 'http';

import authRoutes from "./routes/auth.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import bookingRoutes from "./routes/booking.route.js";

import userRoutes from "./routes/user.route.js";

import { initializeSocket } from "./lib/socket.js";
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import { updateLastActive } from './middleware/updateLastActive.middleware.js';
import notificationRoutes from './routes/notification.routes.js';

import reportsRoutes from './routes/reports.route.js';

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(updateLastActive);

// Booking
//app.use("/bookings", bookingRoutes);

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer file upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// File upload route
app.post("/upload", upload.single("file"), (req, res) => {
  res.send("File uploaded successfully");
});

// Middleware routes
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/api/booking", bookingRoutes);

app.use("/api/users", userRoutes);

app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/reports", reportsRoutes);

// Error-handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(500).json({ message: err.message });
  }
  next();
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your frontend
    credentials: true, // Allow cookies, authentication headers
    methods: "GET,POST,PUT,DELETE", // Allowed methods
    allowedHeaders: "Content-Type,Authorization", // Allowed headers
  })
);

// Change app.listen to server.listen
server.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});