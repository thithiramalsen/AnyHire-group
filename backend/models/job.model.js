import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: String, required: true },
  location: { type: String, required: true },
  district: { type: String, required: true },
  category: { type: String, required: true },
  jobType: { type: String, required: true },
  payment: { type: Number, required: true },
  deadline: { type: Date, required: true },
  postedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

function arrayLimit(val) {
  return val.length <= 5;
}

const Job = mongoose.model("Job", jobSchema);
export default Job;