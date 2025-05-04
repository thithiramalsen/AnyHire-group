import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const JobApprovalTab = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [declinedJobs, setDeclinedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    const fetchJobsAndCategories = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get("/category", { withCredentials: true });
        setCategories(categoriesResponse.data.categories || []);

        // Fetch pending jobs
        const pendingResponse = await axios.get("/job/status?status=pending", { withCredentials: true });
        setPendingJobs(pendingResponse.data);

        // Fetch approved jobs
        const approvedResponse = await axios.get("/job/status?status=approved", { withCredentials: true });
        setApprovedJobs(approvedResponse.data);

        // Fetch declined jobs
        const declinedResponse = await axios.get("/job/status?status=declined", { withCredentials: true });
        setDeclinedJobs(declinedResponse.data);
      } catch (error) {
        console.error("Error fetching jobs and categories:", error);
        toast.error("Failed to load jobs and categories.");
      }
    };

    fetchJobsAndCategories();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`/job/approve/${id}`);
      toast.success("Job approved successfully!");
      setPendingJobs((prev) => prev.filter((job) => job._id !== id));
      // Refresh approved jobs
      const approvedResponse = await axios.get("/job/status?status=approved", { withCredentials: true });
      setApprovedJobs(approvedResponse.data);
    } catch (error) {
      console.error("Error approving job:", error);
      toast.error("Failed to approve job.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.patch(`/job/decline/${id}`);
      toast.success("Job declined successfully!");
      setPendingJobs((prev) => prev.filter((job) => job._id !== id));
      // Refresh declined jobs
      const declinedResponse = await axios.get("/job/status?status=declined", { withCredentials: true });
      setDeclinedJobs(declinedResponse.data);
    } catch (error) {
      console.error("Error declining job:", error);
      toast.error("Failed to decline job.");
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      if (newStatus === 'approved') {
        await axios.patch(`/job/approve/${jobId}`);
      } else if (newStatus === 'declined') {
        await axios.patch(`/job/decline/${jobId}`);
      } else if (newStatus === 'pending') {
        await axios.patch(`/job/pending/${jobId}`);
      }
      
      toast.success(`Job status changed to ${newStatus} successfully!`);
      
      // Refresh all job lists
      const [pendingResponse, approvedResponse, declinedResponse] = await Promise.all([
        axios.get("/job/status?status=pending", { withCredentials: true }),
        axios.get("/job/status?status=approved", { withCredentials: true }),
        axios.get("/job/status?status=declined", { withCredentials: true })
      ]);
      
      setPendingJobs(pendingResponse.data);
      setApprovedJobs(approvedResponse.data);
      setDeclinedJobs(declinedResponse.data);
      
      setIsStatusModalOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error("Error changing job status:", error);
      toast.error("Failed to change job status.");
    }
  };

  const getCategoryName = (categoryId) => {
    // Convert both IDs to numbers for comparison
    const category = categories.find((cat) => Number(cat._id) === Number(categoryId));
    return category ? category.name : "Unknown Category";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'declined':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderJobList = (jobs, showActions = false) => (
    <div className="space-y-3">
      {jobs.length === 0 ? (
        <p className="text-gray-400 text-center py-2">No jobs found.</p>
      ) : (
        jobs.map((job) => (
          <div key={job._id} className="p-4 bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <p className="text-gray-400">Location: <span className="text-white">{job.location}, {job.district}</span></p>
                  <p className="text-gray-400">Category: <span className="text-white">{getCategoryName(job.category)}</span></p>
                  <p className="text-gray-400">Type: <span className="text-white">{job.jobType}</span></p>
                  <p className="text-gray-400">Payment: <span className="text-green-400">Rs. {job.payment}</span></p>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Posted: {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2 ml-4">
                {showActions ? (
                  <>
                    <button
                      onClick={() => handleApprove(job._id)}
                      className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecline(job._id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setIsStatusModalOpen(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Change Status
                  </button>
                )}
              </div>
            </div>

            {job.images && (
              <div className="mt-2">
                <img
                  src={`http://localhost:5000${job.images}`}
                  alt={job.title}
                  className="rounded-lg max-h-32 object-cover"
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Job Management</h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-3 text-white">Pending Jobs</h3>
          {renderJobList(pendingJobs, true)}
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-white">Approved Jobs</h3>
          {renderJobList(approvedJobs)}
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-white">Declined Jobs</h3>
          {renderJobList(declinedJobs)}
        </section>
      </div>

      {/* Status Change Modal */}
      {isStatusModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg w-80 shadow-xl">
            <h3 className="text-lg font-semibold mb-3 text-white">Change Job Status</h3>
            <p className="text-sm text-gray-400 mb-3">Current status: {selectedJob.status}</p>
            
            <div className="space-y-2">
              <button
                onClick={() => handleStatusChange(selectedJob._id, 'pending')}
                className="w-full px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
              >
                Set to Pending
              </button>
              <button
                onClick={() => handleStatusChange(selectedJob._id, 'approved')}
                className="w-full px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
              >
                Set to Approved
              </button>
              <button
                onClick={() => handleStatusChange(selectedJob._id, 'declined')}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Set to Declined
              </button>
            </div>
            
            <button
              onClick={() => {
                setIsStatusModalOpen(false);
                setSelectedJob(null);
              }}
              className="w-full mt-3 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApprovalTab;