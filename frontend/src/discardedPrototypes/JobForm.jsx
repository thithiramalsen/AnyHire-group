import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya"
];

const JobForm = ({ job, onSave, onCancel, readOnly = false }) => {
  const [inputs, setInputs] = useState({
    title: job?.title || '',
    description: job?.description || '',
    location: job?.location || '',
    district: job?.district || '',
    category: job?.category || '',
    jobType: job?.jobType || '',
    payment: job?.payment || '',
    payRate: job?.payRate || '',
    deadline: job?.deadline || '',
    locationType: job?.locationType || '',
  });

  const [jobImage, setJobImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [imagePreviews, setImagePreviews] = useState(null);

  useEffect(() => {
    // Fetch categories from the backend
    axios.get("/category")
      .then(response => {
        setCategories(response.data.categories);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  const handleChange = (e) => {
    if (readOnly) return;
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    if (readOnly) return;
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setJobImage(file);
      setImagePreviews(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (readOnly) return;
    setJobImage(null);
    setImagePreviews(null);
  };

  const handleUseCurrentLocation = () => {
    if (readOnly) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setInputs((prevState) => ({
            ...prevState,
            location: `Latitude: ${latitude}, Longitude: ${longitude}`,
          }));
          setUseCurrentLocation(true);
          setShowLocationInput(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const handleShowLocationInput = () => {
    if (readOnly) return;
    setUseCurrentLocation(false);
    setShowLocationInput(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobImage && !job) {
      toast.error("You must upload an image.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', inputs.title);
    formDataToSend.append('description', inputs.description);
    formDataToSend.append('location', inputs.location);
    formDataToSend.append('district', inputs.district);
    formDataToSend.append('category', inputs.category);
    formDataToSend.append('jobType', inputs.jobType);
    formDataToSend.append('payment', inputs.jobType === 'One-time Gig' ? Number(inputs.payment) : Number(inputs.payRate));
    formDataToSend.append('deadline', inputs.deadline);

    if (jobImage) {
      formDataToSend.append('images', jobImage);
    }

    onSave(formDataToSend);
  };

  return (
    <div className="p-4 bg-gray-800 rounded shadow">
      <form onSubmit={handleSubmit}>
        <h2 className="text-center text-2xl font-bold mb-4 text-white">{job ? "Edit Job" : "Post a Job"}</h2>
        
        <div className="mb-4">
          <label className="block mb-2 text-white">Job Title:</label>
          <input type="text" name="title" onChange={handleChange} value={inputs.title} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" readOnly={readOnly} />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-white">Job Description:</label>
          <textarea name="description" onChange={handleChange} value={inputs.description} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" readOnly={readOnly} />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-white">District:</label>
          <select name="district" onChange={handleChange} value={inputs.district} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" disabled={readOnly}>
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-white">Job Category:</label>
          <select name="category" onChange={handleChange} value={inputs.category} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" disabled={readOnly}>
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-white">Job Type:</label>
          <div>
            <label className="mr-4 text-white"><input type="radio" value="Part-time" name="jobType" onChange={handleChange} checked={inputs.jobType === 'Part-time'} disabled={readOnly} /> Part-time</label>
            <label className="text-white"><input type="radio" value="One-time Gig" name="jobType" onChange={handleChange} checked={inputs.jobType === 'One-time Gig'} disabled={readOnly} /> One-time Gig</label>
          </div>
        </div>
        
        {inputs.jobType === 'One-time Gig' && (
          <div className="mb-4">
            <label className="block mb-2 text-white">Minimum Payment:</label>
            <input type="number" name="payment" onChange={handleChange} value={inputs.payment} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" readOnly={readOnly} />
          </div>
        )}

        {inputs.jobType === 'Part-time' && (
          <div className="mb-4">
            <label className="block mb-2 text-white">Pay Rate (day):</label>
            <input type="number" name="payRate" onChange={handleChange} value={inputs.payRate} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" readOnly={readOnly} />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block mb-2 text-white">Job Deadline:</label>
          <input type="date" name="deadline" onChange={handleChange} value={inputs.deadline} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" readOnly={readOnly} />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-white">Location:</label>
          <div className="flex space-x-4">
            <button type="button" onClick={handleUseCurrentLocation} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={readOnly}>Use Current Location</button>
            <button type="button" onClick={handleShowLocationInput} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={readOnly}>Enter Different Location</button>
          </div>
          {useCurrentLocation && (
            <p className="mt-2 text-white">Current Location: {inputs.location}</p>
          )}
          {showLocationInput && (
            <div className="mt-4">
              <label className="block mb-2 text-white">Google Maps Link:</label>
              <input type="text" name="location" onChange={handleChange} value={inputs.location} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" readOnly={readOnly} />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-white">Upload Images:</label>
          <input type="file" name="images" accept='image/*' onChange={handleFileChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" disabled={readOnly} />
          
          {imagePreviews && (
            <div className="mt-2 relative">
              <img
                src={imagePreviews} // Single image preview
                alt="Brand Preview"
                className="w-32 h-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={handleRemoveImage} // Handle the removal of the image
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                disabled={readOnly}
              >
                X
              </button>
            </div>
          )}

        </div>
        
        {!readOnly && (
          <div className="flex space-x-4">
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">{job ? "Save Changes" : "Post Job"}</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default JobForm;