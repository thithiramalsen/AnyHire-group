import Job from "../models/job.model.js";
import multer, { diskStorage } from 'multer';

// Configure Multer for file uploads
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).array('images', 5); // Limit to 5 images

// Get all jobs
export const getjobs = async (req, res) => {
  try {
    const jobs = await find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a job by ID
export const getJobById = async (req, res) => {
  try {
    const ajob = await findById(req.query.id);
    if (ajob == null) {
      return res.status(404).json({ message: "Cannot find job" });
    }
    res.status(200).json(ajob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Create a new job
export const addJob = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message }); // Handle Multer errors
    }

    // Validate if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    // Validate required fields
    const { title, description, location, district, category, skills, jobType, payment, deadline } = req.body;
    if (!title || !description || !location || !district || !category || !skills || !jobType || !payment || !deadline) {
      return res.status(400).json({ message: "All fields are required." });
    }

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

    // Save job to the database
    const imagePaths = req.files.map((file) => file.path);

    const job = new Job({
      title,
      description,
      images: imagePaths,
      location,
      district,
      category,
      skills,
      jobType,
      payment,
      deadline,
    });

    try {
      const newJob = await job.save();
      res.status(201).json(newJob);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
};

// Update a job
export const updateJob = async (req, res) => {
  try {
    const job = await findById(req.params.id);
    if (job == null) {
      return res.status(404).json({ message: "Cannot find job" });
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
    if (req.body.skills != null) job.skills = req.body.skills;
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
    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get jobs by status (approved or pending)
export const getJobsByStatus = async (req, res) => {
  try {
    const { status } = req.query; // "approved" or "pending"
    const jobs = await Job.find({ status });
    res.status(200).json(jobs);
  } catch (err) {
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