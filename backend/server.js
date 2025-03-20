import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import multer from "multer";
import Redis from "ioredis";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import portfolioRoutes from "./routes/portfolio.route.js";
import jobRouter from "./routes/job.route.js";
import bookingRoutes from "./routes/booking.route.js";


import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

//Middleware
app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request
app.use(cookieParser());

//from Tharusha
app.use(express.urlencoded({ extended: true })); // allows you to parse the body of the request
app.use(cors());

//Booking
app.use("/bookings", bookingRoutes);



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


//MiddleWare routes
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/job", jobRouter); // From Tharusha - Updated to include /api prefix



// Error-handling middleware
app.use((err, req, res, next) => {
	if (err instanceof multer.MulterError) {
	  // Handle Multer-specific errors
	  return res.status(400).json({ message: err.message });
	}
	if (err) {
	  // Handle other errors
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

app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();
});