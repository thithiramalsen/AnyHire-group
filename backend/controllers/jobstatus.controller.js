import JobStatus from "../models/jobstatus.model.js";

export const createJobStatus = async (req, res) => {
  try {
    const newJobStatus = new JobStatus(req.body);
    const savedJobStatus = await newJobStatus.save();
    res.status(201).json(savedJobStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getstatus = async (req, res) => {
  try {
    const jobs = await JobStatus.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const jobStatus = await JobStatus.findById(req.params.id);
    if (!jobStatus) {
      return res.status(404).json({ message: "Job status not found" });
    }
    res.json(jobStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobStatusbycat = async (req, res) => {
  try {
    const category = req.body.category;
    const jobStatus = await JobStatus.findOne({category});
    if (!jobStatus) {
      return res.status(404).json({ message: "Job status not found" });
    }
    res.json(jobStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateJobStatus = async (req, res) => {
  try {
    const updatedJobStatus = await JobStatus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJobStatus) {
      return res.status(404).json({ message: "Job status not found" });
    }
    res.json(updatedJobStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJobStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    const deletedJobStatus = await JobStatus.deleteMany({userId:userId});
    if (!deletedJobStatus) {
      return res.status(404).json({ message: "Job status not found" });
    }
    res.json({ message: "Job status deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};