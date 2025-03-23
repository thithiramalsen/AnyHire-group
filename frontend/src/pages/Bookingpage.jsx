import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState(location.state?.job || null);
  const [jobCat, setJobCat] = useState('');
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    phoneNumber: '',
    email: '',
    experience: '',
    qualifications: '',
    statusDescription: '',
  });

  useEffect(() => {
        if(job) {
            setJobCat(job.category);
        }
    }, [job]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`/job/one?id=${id}`);
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job:', error);
      }
    };
  },[id]);


  useEffect(() => {
    const fetchUserPortfolio = async () => {
      try {
        const response = await axios.get('/portfolio');
        console.log('Portfolio:', response.data);
        if (response.data.length > 0) {
          const portfolio = response.data.find((portfolio) => portfolio.category === jobCat);
          if (portfolio) {
            setUserId(portfolio.user);
            setForm({
              title: job.title,
              phoneNumber: portfolio.phoneNumber,
              email: portfolio.email,
              experience: portfolio.experience,
              qualifications: portfolio.qualifications,
              statusDescription: portfolio.description,
            });
          } else {
            console.log('No matching portfolio found for this category');
          }
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        alert('There was an error fetching your portfolio. Please try again later.');
      }
    };
  
    // Trigger portfolio fetch only if the job category exists
    if (jobCat) {
      fetchUserPortfolio();
    }
  }, [job, jobCat]); // Updated dependency array to include job

    console.log('Job:', job);
    console.log('Form:', form);
    console.log('Job Category:', jobCat);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const newJobStatus = {
          userId,
          category: job.category,
          title: job.title,
          jobType: job.jobType,
          payment: job.payment,
          deadline: job.deadline,
          status: 'pending'
        };
        const response = await axios.post('/jobstatus', newJobStatus);
        alert('Booking submitted successfully');
        navigate('/job-status', { state: { jobStatus: newJobStatus } });
      } catch (error) {
        console.error('Error submitting booking:', error);
      }
    };
  const handleCancel = () => {
    navigate('/find-job');
  };

  if (!job) return <div className="text-center text-white p-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 bg-gradient-to-br from-emerald-900 via-emerald-800 to-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-emerald-400 mb-8">Book This Job</h1>

      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-2xl font-bold text-emerald-300 mb-4">{job.title}</h2>
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

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-6 shadow-md">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Title:</label>
            <input type="text" name="title" value={form.title}  readOnly className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
          </div>
          <div>
            <label className="block mb-2">Phone Number:</label>
            <input type="text" name="phoneNumber" value={form.phoneNumber} readOnly className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
          </div>
          <div>
            <label className="block mb-2">Email:</label>
            <input type="email" name="email" value={form.email}  readOnly className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
          </div>
          <div>
            <label className="block mb-2">Experience:</label>
            <input type="text" name="experience" value={form.experience}  readOnly className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
          </div>
          <div>
            <label className="block mb-2">Qualifications:</label>
            <input type="text" name="qualifications" value={form.qualifications}  readOnly className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-2">Description of your status:</label>
            <textarea name="statusDescription" value={form.statusDescription} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded">Book</button>
          <button type="button" onClick={handleCancel} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default BookingPage;