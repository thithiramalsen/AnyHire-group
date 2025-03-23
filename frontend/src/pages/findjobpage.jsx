import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios.js';

const FindJobPage = () => {
  const [jobs, setJobs] = useState([]);
  const [searchCategory, setSearchCategory] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/job/get');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchCategory) {
      setFilteredJobs(jobs.filter(job => job.category === searchCategory));
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchCategory, jobs]);

  const handleSearchChange = (e) => {
    setSearchCategory(e.target.value);
  };

  const handleBookNow = (jobId) => {
    const job = jobs.find(j => j._id === jobId);
    navigate(`/booking/${jobId}`, { state: { job } });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 bg-gradient-to-br from-emerald-900 via-emerald-800 to-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-center text-emerald-400 mb-8">Find Your Job</h1>
      <p className="text-center mb-8">Search for jobs by category and apply for the ones that suit you best.</p>

      <div className="mb-8">
        <label className="block text-gray-300 mb-2">Search by Category:</label>
        <select value={searchCategory} onChange={handleSearchChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded">
          <option value="">All Categories</option>
          <option value="Delivery & Logistics">Delivery & Logistics</option>
          <option value="Retail & Sales">Retail & Sales</option>
          <option value="Hospitality & Food Service">Hospitality & Food Service</option>
          <option value="Household & Cleaning Services">Household & Cleaning Services</option>
          <option value="Events & Promotions">Events & Promotions</option>
          <option value="Administrative & Office Support">Administrative & Office Support</option>
          <option value="Creative & Digital Jobs">Creative & Digital Jobs</option>
          <option value="Skilled Trades & Maintenance">Skilled Trades & Maintenance</option>
          <option value="Education & Training">Education & Training</option>
          <option value="Healthcare & Wellness">Healthcare & Wellness</option>
          <option value="Construction & Outdoor Work">Construction & Outdoor Work</option>
          <option value="Finance & Business">Finance & Business</option>
          <option value="IT & Technical Support">IT & Technical Support</option>
          <option value="Miscellaneous / Other Jobs">Miscellaneous / Other Jobs</option>
        </select>
      </div>

      <div className="space-y-8">
        {filteredJobs.map(job => (
          <div key={job._id} className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <div className="md:w-1/2 space-y-2">
                <h2 className="text-2xl font-bold text-emerald-300">{job.title}</h2>
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Category:</strong> {job.category}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>District:</strong> {job.district}</p>
                <p><strong>Job Type:</strong> {job.jobType}</p>
                <p><strong>Payment:</strong> Rs. {job.payment}</p>
                <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
              </div>
              {job.images && job.images.length > 0 && (
                <div className="md:w-1/2 flex justify-center">
                  <img src={`http://localhost:5000${job.images[0]}`} alt={job.title} className="rounded-lg shadow-md w-full max-w-sm h-auto object-cover" />
                </div>
              )}
            </div>
            <div className="mt-6 text-right">
              <button onClick={() => handleBookNow(job._id)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindJobPage;