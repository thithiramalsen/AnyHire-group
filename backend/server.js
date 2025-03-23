import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";


import authRoutes from "./routes/auth.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import portfolioRoutes from "./routes/portfolio.route.js";
import jobRouter from "./routes/job.route.js";
import bookingRoutes from "./routes/booking.route.js";
import jobStatusroute from "./routes/jobstatus.route.js";


import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const _dirname = path.resolve();

// Middleware
app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // allows you to parse the body of the request

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

//Booking
app.use("/bookings", bookingRoutes);

// Static file serving for uploads
app.use("/uploads", express.static(path.join(_dirname, 'uploads')));



//MiddleWare routes
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/job", jobRouter); 
app.use("/api/jobstatus", jobStatusroute);



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