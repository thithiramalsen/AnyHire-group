import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';

const BookingHistoryPage = () => {
  const [jobStatuses, setJobStatuses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobStatuses = async () => {
      try {
        const response = await axios.get('/jobstatus/getstatus'); 
        setJobStatuses(response.data);
      } catch (err) {
        setError(err.message);
        console.log(jobStatuses)
      }
    };

    fetchJobStatuses();
  }, []);

  if (error) {
    return <div className="text-center text-white p-10">Error: {error}</div>;
  }

  if (jobStatuses.length === 0) return <div className="text-center text-white p-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-gray-900 text-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-center text-emerald-400 mb-4">Booking History</h1>
      </div>
      {jobStatuses.map((jobStatus) => (
        <div key={jobStatus._id} className="bg-gray-800 text-white rounded-lg shadow-lg p-6 mb-8 relative">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 space-y-4">
              <p><strong>Category:</strong> {jobStatus.category}</p>
              <p><strong>Title:</strong> {jobStatus.title}</p>
              <p><strong>Job Type:</strong> {jobStatus.jobType}</p>
              <p><strong>Payment:</strong> Rs. {jobStatus.payment}</p>
              <p><strong>Deadline:</strong> {new Date(jobStatus.deadline).toLocaleDateString()}</p>
            </div>
          </div>
          {jobStatus.status === 'pending' && (
            <div className="absolute right-10 bottom-4 bg-red-500 text-white inline-block px-3 py-1 rounded-full">Pending</div>
          )}
          {jobStatus.status === 'accepted' && (
            <div className="absolute right-10 bottom-4 bg-blue-500 text-white inline-block px-3 py-1 rounded-full">Accepted</div>
          )}
          {jobStatus.status === 'completed' && (
            <div className="absolute right-10 bottom-4 bg-green-500 text-white inline-block px-3 py-1 rounded-full">Completed</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BookingHistoryPage;