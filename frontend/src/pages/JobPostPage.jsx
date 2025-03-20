import { useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const JobPostPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [], // Updated to handle file uploads
    location: "",
    district: "",
    category: "",
    skills: "",
    jobType: "",
    payment: "",
    deadline: "",
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setFormData({ ...formData, images: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form Data:", formData); // Log formData to verify its structure


    // Create FormData object to send files and other data
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("location", formData.location);
    data.append("district", formData.district);
    data.append("category", formData.category);
    data.append("skills", formData.skills.join(",")); // Convert array to comma-separated string
    data.append("jobType", formData.jobType);
    data.append("payment", formData.payment);
    data.append("deadline", formData.deadline);

    // Append images to FormData
    formData.images.forEach((image) => {
      data.append("images", image);
    });

    try {
      await axios.post("/job/add", formData);
      toast.success("Job posted successfully! It will be reviewed by an admin.");
      setFormData({
        title: "",
        description: "",
        images: [],
        location: "",
        district: "",
        category: "",
        skills: "",
        jobType: "",
        payment: "",
        deadline: "",
      });
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("Failed to post job. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-emerald-400">Post a Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Images</label>
          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Preview ${index}`}
                className="w-20 h-20 object-cover rounded"
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">District</label>
          <select
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          >
            <option value="">Select District</option>
            <option value="Ratnapura">Ratnapura</option>
            <option value="Colombo">Colombo</option>
            <option value="Matara">Matara</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Skills (comma-separated)</label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(",") })}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Job Type</label>
          <select
            value={formData.jobType}
            onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          >
            <option value="">Select Job Type</option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Payment</label>
          <input
            type="number"
            value={formData.payment}
            onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Deadline</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">
          Post Job
        </button>
      </form>
    </div>
  );
};

export default JobPostPage;