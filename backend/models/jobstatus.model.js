import mongoose from "mongoose";

const jobStatusSchema = new mongoose.Schema(
  {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
    },
    payment: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'saved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const JobStatus = mongoose.model("JobStatus", jobStatusSchema);

export default JobStatus;