import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';

const PortfolioUpdatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(location.state?.portfolio || null);
  const [jobStatus, setJobStatus] = useState(location.state?.jobStatus || null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { userId, category } = jobStatus;
        const response = await axios.post(`/portfolio/portfoliobycat`, { id: userId, category });
        setPortfolio(response.data);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
      }
    };

    if (!portfolio) {
      fetchPortfolio();
    }
  }, [jobStatus, portfolio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPortfolio((prevPortfolio) => ({ ...prevPortfolio, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/portfolio/upportfolio/${jobStatus.userId}`, portfolio);
      alert('Portfolio updated successfully');
      navigate('/job-status', { state: { jobStatus: { ...jobStatus, portfolio } } });
    } catch (err) {
      console.error('Error updating portfolio:', err);
    }
  };

  const handleCancel = () => {
    navigate('/job-status', { state: { jobStatus } });
  };

  if (!portfolio) return <div className="text-center text-white p-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 bg-gradient-to-br from-emerald-900 via-emerald-800 to-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-emerald-400 mb-8">Update Portfolio</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block mb-2">Email:</label>
          <input
            type="email"
            name="email"
            value={portfolio.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>
        <div>
          <label className="block mb-2">Phone Number:</label>
          <input
            type="text"
            name="phoneNumber"
            value={portfolio.phoneNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>
        <div>
          <label className="block mb-2">Experience:</label>
          <input
            type="text"
            name="experience"
            value={portfolio.experience}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>
        <div>
          <label className="block mb-2">Qualifications:</label>
          <input
            type="text"
            name="qualifications"
            value={portfolio.qualifications}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded">Save</button>
          <button type="button" onClick={handleCancel} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioUpdatePage;