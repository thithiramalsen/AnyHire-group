import Axios from 'axios';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';
import LocationPicker from './Map/LocationPicker';
import { parseLocationString } from '../lib/map.config';
import { Briefcase, Calendar, DollarSign, MapPin, FileText, Image as ImageIcon } from 'lucide-react';

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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [jobImage, setJobImage] = useState();
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState();

  useEffect(() => {
    axios.get("/category")
      .then(response => {
        setCategories(response.data.categories);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'title':
        if (value.length < 5) {
          error = 'Job title must be at least 5 characters long';
        }
        break;
      case 'description':
        if (value.length < 10) {
          error = 'Description must be at least 10 characters long';
        }
        break;
      case 'district':
        if (!value) {
          error = 'Please select a district';
        }
        break;
      case 'category':
        if (!value) {
          error = 'Please select a category';
        }
        break;
      case 'payment':
      case 'payRate':
        if (value && (isNaN(value) || Number(value) <= 0)) {
          error = 'Payment must be a positive number';
        }
        break;
      case 'deadline':
        if (value) {
          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0); // Set selected date to midnight
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set today to midnight
          if (selectedDate < today) {
            error = 'Deadline must be today or a future date';
          }
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setJobImage(file);
      setImagePreviews(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setJobImage(null);
    setImagePreviews(null);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude},${longitude}`;
          setInputs(prev => ({
            ...prev,
            location: locationString
          }));
          toast.success('Current location set successfully');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(inputs).forEach(key => {
      const error = validateField(key, inputs[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(inputs).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!jobImage) {
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
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error('There was an error posting the job!', error.response?.data || error.message);
      toast.error('Failed to post job. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {/* Header inside the box */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 border-b border-gray-700">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent text-center">
            Post a New Job
          </h2>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Job Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    Job Title
                  </div>
                </label>
                <input
                  type="text"
                  name="title"
                  value={inputs.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-gray-700 border ${errors.title ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors`}
                  placeholder="Enter job title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Job Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Job Category
                  </div>
                </label>
                <select
                  name="category"
                  value={inputs.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-gray-700 border ${errors.category ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors`}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    District
                  </div>
                </label>
                <select
                  name="district"
                  value={inputs.district}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-gray-700 border ${errors.district ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors`}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    Job Type
                  </div>
                </label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 text-gray-300 bg-gray-700 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="radio"
                      value="Part-time"
                      name="jobType"
                      onChange={handleChange}
                      checked={inputs.jobType === 'Part-time'}
                      className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                    />
                    Part-time
                  </label>
                  <label className="flex items-center gap-2 text-gray-300 bg-gray-700 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="radio"
                      value="One-time Gig"
                      name="jobType"
                      onChange={handleChange}
                      checked={inputs.jobType === 'One-time Gig'}
                      className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                    />
                    One-time Gig
                  </label>
                </div>
              </div>

              {/* Payment */}
              {inputs.jobType === 'One-time Gig' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Minimum Payment (Rs.)
                    </div>
                  </label>
                  <input
                    type="number"
                    name="payment"
                    value={inputs.payment}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-gray-700 border ${errors.payment ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    placeholder="Enter minimum payment"
                  />
                  {errors.payment && <p className="text-red-500 text-sm mt-1">{errors.payment}</p>}
                </div>
              ) : inputs.jobType === 'Part-time' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Pay Rate per Day (Rs.)
                    </div>
                  </label>
                  <input
                    type="number"
                    name="payRate"
                    value={inputs.payRate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-gray-700 border ${errors.payRate ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    placeholder="Enter pay rate"
                  />
                  {errors.payRate && <p className="text-red-500 text-sm mt-1">{errors.payRate}</p>}
                </div>
              ) : null}

              {/* Deadline */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Job Deadline
                  </div>
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={inputs.deadline}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-gray-700 border ${errors.deadline ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors`}
                />
                {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Job Description
                </div>
              </label>
              <textarea
                name="description"
                value={inputs.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows="4"
                className={`w-full px-4 py-3 bg-gray-700 border ${errors.description ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors`}
                placeholder="Provide a detailed description of the job..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Location
                </div>
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Use Current Location
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputs(prev => ({ ...prev, location: '' }));
                    toast.success('Click on the map to select a location');
                  }}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Pick Location
                </button>
              </div>
              <LocationPicker 
                onLocationSelect={(location) => {
                  setInputs(prev => ({ ...prev, location }));
                }}
                initialLocation={inputs.location ? parseLocationString(inputs.location) : null}
                selectedLocation={inputs.location}
              />
              {inputs.location && (
                <p className="mt-2 text-sm text-gray-400">
                  Selected location: {inputs.location}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Upload Job Image
                </div>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  name="images"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-3 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-emerald-500 file:text-white
                    hover:file:bg-emerald-600
                    file:cursor-pointer"
                />
                {imagePreviews && (
                  <div className="relative">
                    <img
                      src={imagePreviews}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">Accepted formats: JPG, JPEG, PNG</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold text-lg shadow-lg hover:shadow-emerald-500/25"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobPostingTab;