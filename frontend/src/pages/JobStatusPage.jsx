import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';

const JobStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [jobStatus, setJobStatus] = useState(location.state?.jobStatus || null);
  const [jobStatusdetails, setJobStatusdetails] = useState();
  const [portfolio, setPortfolio] = useState();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobStatusAndPortfolio = async () => {
      try {
        const category = jobStatus.category;
        const id = jobStatus.userId;
        const jobStatusResponse = await axios.post(`/jobstatus/getjobstatusbycat`, { category });
        setJobStatusdetails(jobStatusResponse.data);
        const portfolioResponse = await axios.post(`/portfolio/portfoliobycat`, { id, category });
        setPortfolio(portfolioResponse.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchJobStatusAndPortfolio();
  }, [jobStatus._id, jobStatus.userId]);

  const handleUpdate = () => {
    navigate('/portfolio-update', { state: { jobStatus, portfolio } });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/jobstatus/deletestatus/${jobStatus.userId}`);
      alert('Job status deleted successfully');
      navigate('/find-job');
    } catch (error) {
      console.error('Error deleting job status:', error);
    }
  };

  const handleConfirm = async () => {
    try {
      const updatedStatus = { ...jobStatus, status: 'completed' };
      const response = await axios.put(`/jobstatus/${jobStatus._id}`, updatedStatus);
      setJobStatus(response.data);
    } catch (error) {
      console.error('Error confirming job status:', error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedStatus = { ...jobStatus, status: 'saved' };
      const response = await axios.put(`/jobstatus/${jobStatus._id}`, updatedStatus);
      setJobStatus(response.data);
    } catch (error) {
      console.error('Error saving job status:', error);
    }
  };

  if (error) {
    return <div className="text-center text-white p-10">Error: {error}</div>;
  }

  if (!jobStatus || !portfolio) return <div className="text-center text-white p-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-gray-900 text-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-center text-emerald-400 mb-4">Job Status</h1>
      </div>
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 relative">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 space-y-4">
            <p><strong>Category:</strong> {jobStatus.category}</p>
            <p><strong>Title:</strong> {jobStatus.title}</p>
            <p><strong>Job Type:</strong> {jobStatus.jobType}</p>
            <p><strong>Payment:</strong> Rs. {jobStatus.payment}</p>
            <p><strong>Deadline:</strong> {new Date(jobStatus.deadline).toLocaleDateString()}</p>
            <div className="mt-6 flex justify-end gap-4 items-center relative">
              {jobStatus.status === 'pending' && (
                <div className="absolute left-0 bg-red-500 text-white inline-block px-3 py-1 rounded-full">Pending</div>
              )}
              <button onClick={handleUpdate} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded">Update</button>
              <button onClick={handleDelete} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded">Delete</button>
            </div>
            {jobStatus.status === 'accepted' && (
              <div className="flex justify-end gap-4 mt-6">
                <button onClick={handleConfirm} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded">Confirm</button>
              </div>
            )}
            {jobStatus.status === 'completed' && (
              <div className="flex justify-end gap-4 mt-6">
                <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded">Save</button>
              </div>
            )}
          </div>
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold text-emerald-300 mb-4">Portfolio Details</h2>
            <p><strong>Email:</strong> {portfolio.email}</p>
            <p><strong>Phone Number:</strong> {portfolio.phoneNumber}</p>
            <p><strong>Experience:</strong> {portfolio.experience}</p>
            <p><strong>Qualifications:</strong> {portfolio.qualifications}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobStatusPage;