import Axios from 'axios';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';
import LocationPicker from './Map/LocationPicker';

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya"
];

const JobPostingTab = () => {
  const [inputs, setInputs] = useState({
    title: '',
    description: '',
    location: '',
    district: '',
    category: '',
    jobType: '',
    payment: '',
    payRate: '',
    deadline: '',
    locationType: '',
  });

  console.log(inputs);
  const [jobImage,setJobImage] = useState();
  const [categories, setCategories] = useState([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [imagePreviews, setImagePreviews] = useState();

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
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setJobImage(file);
    setImagePreviews(URL.createObjectURL(file));
  }};

  const handleRemoveImage = (index) => {
    const newImages = inputs.images.filter((_, i) => i !== index);
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);
    setInputs((prevState) => ({
      ...prevState,
      images: newImages,
    }));
    setImagePreviews(newImagePreviews);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setInputs((prevState) => ({
                    ...prevState,
                    location: `${latitude},${longitude}`
                }));
            },
            (error) => {
                console.error("Error fetching location:", error);
                toast.error("Could not get your location");
            }
        );
    } else {
        toast.error("Geolocation is not supported by this browser.");
    }
  };

  const handleShowLocationInput = () => {
    setUseCurrentLocation(false);
    setShowLocationInput(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobImage) {
      toast.error("You must uploa an image.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', inputs.title);
    formDataToSend.append('description', inputs.description);

    formDataToSend.append('location', inputs.location);
    formDataToSend.append('district', inputs.district);
    formDataToSend.append('category', inputs.category); // Category is appended here
    formDataToSend.append('jobType', inputs.jobType);
    formDataToSend.append('payment', inputs.jobType === 'One-time Gig' ? Number(inputs.payment) : Number(inputs.payRate));
    formDataToSend.append('deadline', inputs.deadline);

    if (jobImage) {
      formDataToSend.append('images', jobImage);
    }


    try {
      await axios.post("/job/add", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Job posted successfully!');
      setInputs({
        title: '',
        description: '',
        location: '',
        district: '',
        category: '',
        jobType: '',
        payment: '',
        payRate: '',
        deadline: '',
        locationType: '',
      });
      setJobImage(null);
      setImagePreviews(null);
    } catch (error) {
      console.error('There was an error posting the job!', error.response?.data || error.message);
      toast.error('Failed to post job. Please try again.');
    }
  };

 

  return (
    <div className="p-4 bg-gray-800 rounded shadow">
      <form onSubmit={handleSubmit}>
        <h2 className="text-center text-2xl font-bold mb-4 text-white">Post a Job</h2>
        
        <div className="mb-4">
          <label className="block mb-2 text-white">Job Title:</label>
          <input type="text" name="title" onChange={handleChange} value={inputs.title} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-white">Job Description:</label>
          <textarea name="description" onChange={handleChange} value={inputs.description} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-white">District:</label>
          <select name="district" onChange={handleChange} value={inputs.district} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-white">Job Category:</label>
          <select name="category" onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
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
            <label className="mr-4 text-white"><input type="radio" value="Part-time" name="jobType" onChange={handleChange} checked={inputs.jobType === 'Part-time'} /> Part-time</label>
            <label className="text-white"><input type="radio" value="One-time Gig" name="jobType" onChange={handleChange} checked={inputs.jobType === 'One-time Gig'} /> One-time Gig</label>
          </div>
        </div>
        
        {inputs.jobType === 'One-time Gig' && (
          <div className="mb-4">
            <label className="block mb-2 text-white">Minimum Payment:</label>
            <input type="number" name="payment" onChange={handleChange} value={inputs.payment} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
          </div>
        )}

        {inputs.jobType === 'Part-time' && (
          <div className="mb-4">
            <label className="block mb-2 text-white">Pay Rate (day):</label>
            <input type="number" name="payRate" onChange={handleChange} value={inputs.payRate} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block mb-2 text-white">Job Deadline:</label>
          <input type="date" name="deadline" onChange={handleChange} value={inputs.deadline} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-white">Location:</label>
          <LocationPicker 
              onLocationSelect={(location) => {
                  setInputs(prev => ({ ...prev, location }));
              }}
              initialLocation={inputs.location ? parseLocationString(inputs.location) : null}
          />
          <div className="mt-2 flex space-x-4">
              <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                  Use Current Location
              </button>
          </div>
          {inputs.location && (
              <p className="mt-2 text-sm text-gray-400">
                  Selected location: {inputs.location}
              </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-white">Upload Images:</label>
          <input type="file" name="images" accept='image/*' onChange={handleFileChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" />
          
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
              >
                X
              </button>
            </div>
          )}

        </div>
        
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Post Job</button>
      </form>
    </div>
  );
};

export default JobPostingTab;