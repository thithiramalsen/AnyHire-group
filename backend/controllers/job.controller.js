import Job from "../models/job.model.js";
import multer from "multer";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).array("images", 5); // Limit to 5 images

// Get all jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new job
export const addJob = async (req, res) => {


   

    // Validate required fields
    const { title, description, location, district, category, jobType, payment, deadline } = req.body;
    if (!title || !description || !location || !district || !category || !jobType || !payment || !deadline) {
      return res.status(400).json({ message: "All fields are required." });
    }
    console.log(req.body);

    // Validate field lengths
    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({ message: "Title must be between 3 and 100 characters." });
    }
    if (description.length < 10 || description.length > 1000) {
      return res.status(400).json({ message: "Description must be between 10 and 1000 characters." });
    }

    // Validate payment
    if (isNaN(payment) || payment <= 0) {
      return res.status(400).json({ message: "Payment must be a positive number." });
    }

    // Validate deadline
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate < new Date()) {
      return res.status(400).json({ message: "Deadline must be a valid future date." });
    }





    const job = new Job({
      title,
      description,
      images: req.file ? `/uploads/${req.file.filename}` : "",
      location,
      district,
      category: Number(category), // Convert to number when saving
      jobType,
      payment,
      deadline,
      createdBy: req.user._id, // Associate the job with the logged-in user
    });

    try {
      const newJob = await job.save();
      res.status(201).json(newJob);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  
};

// Update a job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Validate fields if provided in the request
    if (req.body.title && (req.body.title.length < 3 || req.body.title.length > 100)) {
      return res.status(400).json({ message: "Title must be between 3 and 100 characters." });
    }
    if (req.body.description && (req.body.description.length < 10 || req.body.description.length > 1000)) {
      return res.status(400).json({ message: "Description must be between 10 and 1000 characters." });
    }
    if (req.body.payment && (isNaN(req.body.payment) || req.body.payment <= 0)) {
      return res.status(400).json({ message: "Payment must be a positive number." });
    }
    if (req.body.deadline) {
      const deadlineDate = new Date(req.body.deadline);
      if (isNaN(deadlineDate.getTime()) || deadlineDate < new Date()) {
        return res.status(400).json({ message: "Deadline must be a valid future date." });
      }
    }

    // Update fields
    if (req.body.title != null) job.title = req.body.title;
    if (req.body.description != null) job.description = req.body.description;
    if (req.body.images != null) job.images = req.body.images;
    if (req.body.location != null) job.location = req.body.location;
    if (req.body.district != null) job.district = req.body.district;
    if (req.body.category != null) job.category = req.body.category;
    if (req.body.skills != null) job.skills = req.body.skills.split(",");
    if (req.body.jobType != null) job.jobType = req.body.jobType;
    if (req.body.payment != null) job.payment = req.body.payment;
    if (req.body.deadline != null) job.deadline = req.body.deadline;

    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a job
export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        
        const job = await Job.findOne({ _id: Number(id) });
        if (!job) {
            return res.status(404).json({ 
                success: false, 
                message: "Job not found" 
            });
        }

        // Delete associated bookings and payments
        const bookings = await Booking.find({ jobId: job._id });
        for (const booking of bookings) {
            const payment = await Payment.findOne({ bookingId: booking._id });
            if (payment) {
                await Payment.deleteOne({ _id: payment._id });
            }
            await Booking.deleteOne({ _id: booking._id });
        }

        await Job.deleteOne({ _id: Number(id) });

        res.json({
            success: true,
            message: "Job and associated records deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete job", 
            error: error.message 
        });
    }
};

// Get jobs by status (approved or pending)
export const getJobsByStatus = async (req, res) => {
  try {
    const { status } = req.query; // "approved" or "pending"
    if (!status) {
      return res.status(400).json({ message: "Status query parameter is required." });
    }

    let jobs;

    if (req.user.role === "admin") {
      // Admin can see all jobs with the given status
      jobs = await Job.find({ status });
    } else {
      // Regular users can only see their own jobs with the given status
      jobs = await Job.find({ status, createdBy: req.user._id });
    }

    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching jobs by status:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get jobs by user ID
export const getJobsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const jobs = await Job.find({ createdBy: (userId) });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching jobs by user ID:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Other controller functions...

export const getJobsApproved = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "approved" }) // Only fetch approved jobs
      .populate("createdBy", "name"); // Populate Job Poster name
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Approve a job
export const approveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndUpdate(id, { status: "approved" }, { new: true });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const declineJob = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Decline job request received for ID:", id);

    const job = await Job.findById(id);
    if (!job) {
      console.log("Job not found for ID:", id);
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = "declined";
    await job.save();
    console.log("Job declined successfully:", job);

    res.status(200).json({ message: "Job declined successfully", job });
  } catch (error) {
    console.error("Error declining job:", error);
    res.status(500).json({ message: "Failed to decline job" });
  }
};

// Set job to pending
export const setJobToPending = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Set job to pending request received for ID:", id);

    const job = await Job.findById(id);
    if (!job) {
      console.log("Job not found for ID:", id);
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = "pending";
    await job.save();
    console.log("Job set to pending successfully:", job);

    res.status(200).json({ message: "Job set to pending successfully", job });
  } catch (error) {
    console.error("Error setting job to pending:", error);
    res.status(500).json({ message: "Failed to set job to pending" });
  }
};

// Get public approved jobs (no authentication required)
export const getPublicApprovedJobs = async (req, res) => {
  try {
    // Get all approved jobs
    const jobs = await Job.find({ status: "approved" })
      .populate("createdBy", "name")
      .select("-__v");

    // Get all bookings with statuses that make a job unavailable
    const unavailableBookings = await Booking.find({
      status: {
        $in: [
          'accepted',
          'in_progress',
          'completed_by_seeker',
          'completed',
          'payment_pending',
          'paid'
        ]
      }
    });

    // Create a Set of unavailable job IDs for faster lookup
    const unavailableJobIds = new Set(unavailableBookings.map(booking => booking.jobId.toString()));

    // Filter out jobs that are unavailable
    const availableJobs = jobs.filter(job => !unavailableJobIds.has(job._id.toString()));

    res.status(200).json(availableJobs);
  } catch (err) {
    console.error("Error fetching public approved jobs:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get available jobs for application (filters out jobs with certain statuses)
export const getAvailableJobs = async (req, res) => {
  try {
    // Get all approved jobs
    const jobs = await Job.find({ status: "approved" })
      .populate("createdBy", "name")
      .select("-__v");

    // Get all bookings with statuses that make a job unavailable
    const unavailableJobIds = await Booking.distinct('jobId', {
      status: {
        $in: [
          'accepted',
          'in_progress',
          'completed_by_seeker',
          'completed',
          'payment_pending',
          'paid'
        ]
      }
    });

    // Convert job IDs to numbers for comparison
    const unavailableJobIdsNumbers = unavailableJobIds.map(id => Number(id));

    // Filter out jobs that are unavailable
    const availableJobs = jobs.filter(job => !unavailableJobIdsNumbers.includes(job._id));

    res.status(200).json(availableJobs);
  } catch (err) {
    console.error("Error fetching available jobs:", err.message);
    res.status(500).json({ message: err.message });
  }
};