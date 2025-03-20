import { useEffect, useState } from "react";
import axios from "../lib/axios";

const JobsTab = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get("/job/get"); // Adjust API endpoint as needed
                setJobs(response.data);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (jobs.length === 0) {
        return <div>No jobs found.</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Available Jobs</h2>
            <div className="space-y-4">
                {jobs.map((job) => (
                    <div key={job._id} className="p-4 bg-gray-800 rounded shadow">
                        <p><strong>Title:</strong> {job.title}</p>
                        <p><strong>Description:</strong> {job.description}</p>
                        <p><strong>Location:</strong> {job.location}</p>
                        <p><strong>Payment:</strong> Rs. {job.payment}</p>
                        <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobsTab;