import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const PendingJobsTab = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [declinedJobs, setDeclinedJobs] = useState([]);
  const [categories, setCategories] = useState([]); // Store the categories
  const [userId, setUserId] = useState(null); // Store the user's ID
  const [editingJob, setEditingJob] = useState(null); // State to manage the job being edited

  useEffect(() => {
    const fetchJobsAndCategories = async () => {
      try {
        // Fetch the user's profile
        const userResponse = await axios.get("/auth/profile", { withCredentials: true });
        setUserId(userResponse.data._id);

        // Fetch categories
        const categoriesResponse = await axios.get("/category", { withCredentials: true });
        setCategories(categoriesResponse.data.categories || []);

        // Fetch user's jobs
        const jobsResponse = await axios.get(`/job/user/${userResponse.data._id}`, { withCredentials: true });
        const jobs = jobsResponse.data;

        // Separate jobs by status
        setPendingJobs(jobs.filter(job => job.status === "pending"));
        setApprovedJobs(jobs.filter(job => job.status === "approved"));
        setDeclinedJobs(jobs.filter(job => job.status === "declined"));
      } catch (error) {
        console.error("Error fetching jobs and categories:", error);
        toast.error("Failed to load jobs and categories.");
      }
    };

    fetchJobsAndCategories();
  }, []);

  const handleEdit = (job) => {
    setEditingJob(job);
  };

  const handleSaveEdit = async (updatedJob) => {
    try {
      await axios.patch(`/job/up/${updatedJob._id}`, updatedJob);
      setPendingJobs((prev) =>
        prev.map((job) => (job._id === updatedJob._id ? updatedJob : job))
      );
      setEditingJob(null);
      toast.success("Job updated successfully!");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job.");
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await axios.delete(`/job/del/${jobId}`);
      setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
      setApprovedJobs((prev) => prev.filter((job) => job._id !== jobId));
      setDeclinedJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully!");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job.");
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const renderJobList = (jobs, allowEdit = false) => (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        jobs.map((job) => (
          <div key={job._id} className="p-4 bg-gray-800 rounded shadow">
            <p><strong>Title:</strong> {job.title}</p>
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>District:</strong> {job.district}</p>
            <p><strong>Category:</strong> {getCategoryName(job.category)}</p>
            <p><strong>Job Type:</strong> {job.jobType}</p>
            <p><strong>Payment:</strong> {job.payment}</p>
            <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
            {job.images && (
              <img
                src={`http://localhost:5000${job.images}`}
                alt={job.title}
                className="mt-4 w-full h-auto rounded"
                style={{ maxWidth: "300px", maxHeight: "300px" }}
              />
            )}
            <div className="flex space-x-2 mt-2">
              {allowEdit && (
                <button
                  onClick={() => handleEdit(job)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDelete(job._id)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Jobs</h2>
      {editingJob ? (
        <JobEditForm job={editingJob} onSave={handleSaveEdit} onCancel={() => setEditingJob(null)} categories={categories} />
      ) : (
        renderJobList(pendingJobs, true)
      )}

      <hr className="my-8 border-gray-600" />

      <h2 className="text-2xl font-bold mb-4">Approved Jobs</h2>
      {renderJobList(approvedJobs)}

      <hr className="my-8 border-gray-600" />

      <h2 className="text-2xl font-bold mb-4">Declined Jobs</h2>
      {renderJobList(declinedJobs)}
    </div>
  );
};

const JobEditForm = ({ job, onSave, onCancel, categories }) => {
  const [formData, setFormData] = useState(job);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Edit Job</h2>
      <div>
        <label className="block text-gray-300 mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-1">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-1">District</label>
        <input
          type="text"
          name="district"
          value={formData.district}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-1">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          required
        >
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-gray-300 mb-1">Job Type</label>
        <input
          type="text"
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-1">Payment</label>
        <input
          type="number"
          name="payment"
          value={formData.payment}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-1">Deadline</label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          required
        />
      </div>
      <div className="flex space-x-4">
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
      </div>
    </form>
  );
};

export default PendingJobsTab;