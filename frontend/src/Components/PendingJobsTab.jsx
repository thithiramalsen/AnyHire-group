import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Edit2, Trash2, Clock, Check, X, MapPin, Calendar, Banknote, Briefcase, Tag } from "lucide-react";

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
        console.log("Fetching user profile...");
        // Fetch the user's profile
        const userResponse = await axios.get("/auth/profile", { withCredentials: true });
        setUserId(userResponse.data._id);
        console.log("User profile fetched successfully:", userResponse.data);

        console.log("Fetching categories...");
        // Fetch categories
        const categoriesResponse = await axios.get("/category", { withCredentials: true });
        setCategories(categoriesResponse.data.categories || []);
        console.log("Categories fetched successfully:", categoriesResponse.data.categories);

        console.log(`Fetching jobs for user ID: ${userResponse.data._id}...`);
        // Fetch user's jobs
        const jobsResponse = await axios.get(`/job/user/${userResponse.data._id}`, { withCredentials: true });
        const jobs = jobsResponse.data;
        console.log("Jobs fetched successfully:", jobs);

        // Separate jobs by status
        setPendingJobs(jobs.filter(job => job.status === "pending"));
        setApprovedJobs(jobs.filter(job => job.status === "approved"));
        setDeclinedJobs(jobs.filter(job => job.status === "declined"));
        console.log("Jobs categorized successfully:", {
          pending: jobs.filter(job => job.status === "pending"),
          approved: jobs.filter(job => job.status === "approved"),
          declined: jobs.filter(job => job.status === "declined"),
        });
      } catch (error) {
        console.error("Error fetching jobs and categories:", error);
        toast.error("Failed to load jobs and categories.");
      }
    };

    fetchJobsAndCategories();
  }, []);

  const handleEdit = (job) => {
    console.log("Editing job:", job);
    setEditingJob(job);
  };

  const handleSaveEdit = async (updatedJob) => {
    try {
      console.log("Saving updated job:", updatedJob);
      await axios.patch(`/job/up/${updatedJob._id}`, updatedJob);
      setPendingJobs((prev) =>
        prev.map((job) => (job._id === updatedJob._id ? updatedJob : job))
      );
      setEditingJob(null);
      toast.success("Job updated successfully!");
      console.log("Job updated successfully:", updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job.");
    }
  };

  const handleDelete = async (jobId) => {
    try {
      console.log(`Deleting job with ID: ${jobId}...`);
      await axios.delete(`/job/del/${jobId}`);
      setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
      setApprovedJobs((prev) => prev.filter((job) => job._id !== jobId));
      setDeclinedJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully!");
      console.log(`Job with ID: ${jobId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job.");
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => Number(cat._id) === Number(categoryId));
    return category ? category.name : "Unknown Category";
  };

  const renderJobList = (jobs, allowEdit = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {jobs.length === 0 ? (
        <div className="col-span-2 text-center py-8 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No jobs found.</p>
        </div>
      ) : (
        jobs.map((job) => (
          <div key={job._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-2xl">
            {/* Job Image */}
            {job.images && (
              <div className="relative h-48">
                <img
                  src={`http://localhost:5000${job.images}`}
                  alt={job.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm ${
                  job.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  job.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {job.status}
                </div>
              </div>
            )}

            {/* Job Details */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-emerald-400 mb-4">{job.title}</h3>
              
              <div className="space-y-3">
                <p className="text-gray-300">{job.description}</p>

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <MapPin size={16} className="text-emerald-500" />
                    <span>{job.district}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Tag size={16} className="text-emerald-500" />
                    <span>{getCategoryName(job.category)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Briefcase size={16} className="text-emerald-500" />
                    <span>{job.jobType}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Banknote size={16} className="text-emerald-500" />
                    <span>Rs. {job.payment}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300 col-span-2">
                    <Calendar size={16} className="text-emerald-500" />
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-4">
                  {allowEdit && (
                    <button
                      onClick={() => handleEdit(job)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center text-emerald-500">
          <Clock className="mr-2" /> Pending Jobs
        </h2>
        {editingJob ? (
          <JobEditForm 
            job={editingJob} 
            onSave={handleSaveEdit} 
            onCancel={() => setEditingJob(null)} 
            categories={categories} 
          />
        ) : (
          renderJobList(pendingJobs, true)
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center text-green-500">
          <Check className="mr-2" /> Approved Jobs
        </h2>
        {renderJobList(approvedJobs)}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center text-red-500">
          <X className="mr-2" /> Declined Jobs
        </h2>
        {renderJobList(declinedJobs)}
      </div>
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