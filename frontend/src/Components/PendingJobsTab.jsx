import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const PendingJobsTab = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [declinedJobs, setDeclinedJobs] = useState([]);
  const [userRole, setUserRole] = useState(null); // Store the user's role

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetch the user's role
        const userResponse = await axios.get("/auth/profile", { withCredentials: true });
        setUserRole(userResponse.data.role);

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
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs.");
      }
    };

    fetchJobs();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`/job/approve/${id}`);
      toast.success("Job approved successfully!");
      setPendingJobs((prev) => prev.filter((job) => job._id !== id));
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
    } catch (error) {
      console.error("Error declining job:", error);
      toast.error("Failed to decline job.");
    }
  };

  const renderJobList = (jobs, showActions = false) => (
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
            <p><strong>Category:</strong> {job.category}</p>
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
            {showActions && (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleApprove(job._id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecline(job._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Jobs</h2>
      {renderJobList(pendingJobs, userRole === "admin")}

      <hr className="my-8 border-gray-600" />

      <h2 className="text-2xl font-bold mb-4">Approved Jobs</h2>
      {renderJobList(approvedJobs)}

      <hr className="my-8 border-gray-600" />

      <h2 className="text-2xl font-bold mb-4">Declined Jobs</h2>
      {renderJobList(declinedJobs)}
    </div>
  );
};

export default PendingJobsTab;