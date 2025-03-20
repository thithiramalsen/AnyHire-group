import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;