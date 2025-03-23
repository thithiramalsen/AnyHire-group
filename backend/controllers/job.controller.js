import Job from "../models/job.model.js";

// Get all jobs
export const getjobs = async (req, res) => {
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
    const ajob = await Job.findById(req.query.id);
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
    console.log(req.files);
    try {
      
      const imagePaths = req.files.map(file => file.path);

      const job = new Job({
        title: req.body.title,
        description: req.body.description,
        images:  req.files? `/uploads/${req.files[0].filename}` : '',
        location: req.body.location,
        district: req.body.district,
        category: req.body.category,
        skills: JSON.parse(req.body.skills),
        jobType: req.body.jobType,
        payment: req.body.payment,
        deadline: req.body.deadline,
      });

      const newJob = await job.save();
      res.status(201).json(newJob);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};

// Update a job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job == null) {
      return res.status(404).json({ message: "Cannot find job" });
    }

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
    const { status } = req.query;
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