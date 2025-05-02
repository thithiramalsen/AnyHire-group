import mongoose from "mongoose";
import Counter from './counter.model.js';

const jobSchema = new mongoose.Schema({
  _id: { type: Number },
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
  status: { type: String, enum: ["pending", "approved", "declined", "completed"], default: "pending" },
  createdBy: { type: Number, ref: "User", required: true }
});

// Add pre-save middleware to handle auto-incrementing
jobSchema.pre('save', async function(next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'jobId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }
  next();
});

function arrayLimit(val) {
  return val.length <= 5;
}

const Job = mongoose.model("Job", jobSchema);
export default Job;