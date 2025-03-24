import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const PendingJobsTab = () => {
  const [pendingJobs, setPendingJobs] = useState([]);

  useEffect(() => {
    const fetchPendingJobs = async () => {
      try {
        const response = await axios.get("/job/status?status=pending", {
          withCredentials: true, // Ensure cookies are sent with the request
        });
        setPendingJobs(response.data);
      } catch (error) {
        console.error("Error fetching pending jobs:", error);
        toast.error("Failed to load pending jobs.");
      }
    };
    
    fetchPendingJobs();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Jobs</h2>
      <div className="space-y-4">
        {pendingJobs.length === 0 ? (
          <p>No pending jobs found.</p>
        ) : (
          pendingJobs.map((job) => (
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
                <>
                  <img 
                    src={`http://localhost:5000${job.images}`} 
                    alt={job.title} 
                    className="mt-4 w-full h-auto rounded" 
                    style={{ maxWidth: "300px", maxHeight: "300px" }} // Set max width and height
                  />
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingJobsTab;