import React, { useState } from "react";
import axios from "../lib/axios.js";
import { form } from "framer-motion/client";

const skillsMapping = {
  "Delivery & Logistics": [], "Retail & Sales": [], "Hospitality & Food Service": [], "Household & Cleaning Services": [], "Events & Promotions": [],
  "Administrative & Office Support": [], "Creative & Digital Jobs": [], "Skilled Trades & Maintenance": [], "Education & Training": [], 
  "Healthcare & Wellness": [], "Construction & Outdoor Work": [], "Finance & Business": [], "IT & Technical Support": [], "Miscellaneous / Other Jobs": [],
};

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", 
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", 
  "Trincomalee", "Vavuniya"
];

function JobPostingForm() {
  const [inputs, setInputs] = useState({
    title: '',
    description: '',
    images: [],
    location: '',
    district: '',
    category: '',
    skills: [],
    jobType: '',
    payment: '',
    payRate: '',
    deadline: '',
    locationType: '',
  });

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 5) {
      alert('You can only upload a maximum of 5 images');
      return;
    }
    setInputs((prevState) => ({
      ...prevState,
      images: files,
    }));
  };

  const handleUseCurrentLocation = () => {
    setInputs((prevState) => ({
      ...prevState,
      locationType: 'current',
    }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setInputs((prevState) => ({
            ...prevState,
            location: `Lat: ${latitude}, Long: ${longitude}`,
          }));
        },
        (error) => {
          console.error('Error fetching location:', error);
          alert('Unable to fetch location. Please enter it manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleCategoryChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      category: e.target.value,
      skills: [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', inputs.title);
    formData.append('description', inputs.description);
    formData.append('location', inputs.location);
    formData.append('district', inputs.district);
    formData.append('category', inputs.category);
    formData.append('skills', JSON.stringify(inputs.skills));
    formData.append('jobType', inputs.jobType);
    formData.append('payment', inputs.jobType === 'One-time Gig' ? inputs.payment : inputs.payRate);
    formData.append('deadline', inputs.deadline);
    inputs.images.forEach((image) => {
      formData.append("images", image);
    });
    console.log(inputs.images)
    await axios.post("/job/add", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(() => {
      alert('Job posted successfully!');
    })
    .catch(error => {
      console.error('There was an error posting the job!', error);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Post a Job</h2>
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Job Title:</label>
          <input type="text" name="title" onChange={handleChange} value={inputs.title} maxLength="60" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Job Description:</label>
          <textarea name="description" onChange={handleChange} value={inputs.description} maxLength="500" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Related Images:</label>
          <input type="file" accept=".jpg,.png" multiple onChange={handleImageChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Job Location:</label>
          <div className="flex gap-2">
            <button type="button" className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={handleUseCurrentLocation}>Use Current Location</button>
            <button type="button" className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={() => setInputs((prevState) => ({ ...prevState, locationType: 'different' }))}>Enter Different Location</button>
          </div>
          {inputs.locationType === 'different' && (
            <div className="mt-2">
              <input type="text" placeholder="Paste Google Maps URL here" name="location" onChange={handleChange} value={inputs.location} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
            </div>
          )}
          {inputs.locationType === 'current' && inputs.location && (
            <p className="mt-2 text-gray-300">{inputs.location}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-300 mb-1">District:</label>
          <select name="district" onChange={handleChange} value={inputs.district} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded">
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Job Category:</label>
          <select name="category" onChange={handleCategoryChange} value={inputs.category} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded">
            <option value="">Select Category</option>
            {Object.keys(skillsMapping).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Job Type:</label>
          <div className="flex gap-2">
            <label className="flex items-center">
              <input type="radio" value="Part-time" name="jobType" checked={inputs.jobType === 'Part-time'} onChange={handleChange} className="mr-2" />
              Part-time
            </label>
            <label className="flex items-center">
              <input type="radio" value="One-time Gig" name="jobType" checked={inputs.jobType === 'One-time Gig'} onChange={handleChange} className="mr-2" />
              One-time Gig
            </label>
          </div>
        </div>
        {inputs.jobType === 'One-time Gig' && (
          <div>
            <label className="block text-gray-300 mb-1">Minimum Payment:</label>
            <div className="flex items-center">
              <span className="text-gray-300">Rs.</span>
              <input type="text" name="payment" onChange={handleChange} value={inputs.payment} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
              <span className="text-gray-300">.00</span>
            </div>
          </div>
        )}
        {inputs.jobType === 'Part-time' && (
          <div>
            <label className="block text-gray-300 mb-1">Pay Rate (per hour/day):</label>
            <div className="flex items-center">
              <span className="text-gray-300">Rs.</span>
              <input type="text" name="payRate" onChange={handleChange} value={inputs.payRate} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
              <span className="text-gray-300">.00</span>
            </div>
          </div>
        )}
        <div>
          <label className="block text-gray-300 mb-1">Job Deadline:</label>
          <input type="date" name="deadline" onChange={handleChange} value={inputs.deadline} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
        </div>
        <div className="text-center">
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Post Job</button>
        </div>
      </form>
    </div>
  );
}

export default JobPostingForm;