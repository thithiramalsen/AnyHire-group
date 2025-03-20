import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const PendingJobsTab = () => {
  const [pendingJobs, setPendingJobs] = useState([]);

  useEffect(() => {
    const fetchPendingJobs = async () => {
      try {
        const response = await axios.get("/job/status?status=pending");
        setPendingJobs(response.data);
      } catch (error) {
        console.error("Error fetching pending jobs:", error);
      }
    };

    fetchPendingJobs();
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Jobs</h2>
      <div className="space-y-4">
        {pendingJobs.map((job) => (
          <div key={job._id} className="p-4 bg-gray-800 rounded shadow">
            <p><strong>Title:</strong> {job.title}</p>
            <p><strong>Description:</strong> {job.description}</p>
            <button
              onClick={() => handleApprove(job._id)}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded"
            >
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingJobsTab;