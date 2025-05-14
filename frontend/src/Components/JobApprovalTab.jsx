import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Search, Filter, Eye, Trash2, Check, X, Clock } from "lucide-react";

const JobApprovalTab = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [declinedJobs, setDeclinedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchJobsAndCategories = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get("/category", { withCredentials: true });
        setCategories(categoriesResponse.data.categories || []);

        // Fetch pending jobs
        const pendingResponse = await axios.get("/job/status?status=pending", { withCredentials: true });
        setPendingJobs(pendingResponse.data);

        // Fetch approved jobs
        const approvedResponse = await axios.get("/job/status?status=approved", { withCredentials: true });
        setApprovedJobs(approvedResponse.data);

        // Fetch declined jobs
        const declinedResponse = await axios.get("/job/status?status=declined", { withCredentials: true });
        setDeclinedJobs(declinedResponse.data);
      } catch (error) {
        console.error("Error fetching jobs and categories:", error);
        toast.error("Failed to load jobs and categories.");
      }
    };

    fetchJobsAndCategories();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`/job/approve/${id}`);
      toast.success("Job approved successfully!");
      setPendingJobs((prev) => prev.filter((job) => job._id !== id));
      // Refresh approved jobs
      const approvedResponse = await axios.get("/job/status?status=approved", { withCredentials: true });
      setApprovedJobs(approvedResponse.data);
    } catch (error) {
      console.error("Error approving job:", error);
      toast.error("Failed to approve job.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.patch(`/job/decline/${id}`);
      toast.success("Job declined successfully!");
      setPendingJobs((prev) => prev.filter((job) => job._id !== id));
      // Refresh declined jobs
      const declinedResponse = await axios.get("/job/status?status=declined", { withCredentials: true });
      setDeclinedJobs(declinedResponse.data);
    } catch (error) {
      console.error("Error declining job:", error);
      toast.error("Failed to decline job.");
    }
  };

  const handleDelete = async (jobId) => {
    toast((t) => (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete this job? This will also delete all associated bookings and payments.
        </p>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              try {
                await axios.delete(`/job/del/${jobId}`);
                setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
                setApprovedJobs((prev) => prev.filter((job) => job._id !== jobId));
                setDeclinedJobs((prev) => prev.filter((job) => job._id !== jobId));
                toast.success("Job deleted successfully!");
                toast.dismiss(t.id);
              } catch (error) {
                console.error("Error deleting job:", error);
                toast.error("Failed to delete job.");
              }
            }}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 
              rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-300 
              bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'transparent',
        boxShadow: 'none',
      },
    });
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      if (newStatus === 'approved') {
        await axios.patch(`/job/approve/${jobId}`);
      } else if (newStatus === 'declined') {
        await axios.patch(`/job/decline/${jobId}`);
      } else if (newStatus === 'pending') {
        await axios.patch(`/job/pending/${jobId}`);
      }
      
      toast.success(`Job status changed to ${newStatus} successfully!`);
      
      // Refresh all job lists
      const [pendingResponse, approvedResponse, declinedResponse] = await Promise.all([
        axios.get("/job/status?status=pending", { withCredentials: true }),
        axios.get("/job/status?status=approved", { withCredentials: true }),
        axios.get("/job/status?status=declined", { withCredentials: true })
      ]);
      
      setPendingJobs(pendingResponse.data);
      setApprovedJobs(approvedResponse.data);
      setDeclinedJobs(declinedResponse.data);
      
      setIsStatusModalOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error("Error changing job status:", error);
      toast.error("Failed to change job status.");
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => Number(cat._id) === Number(categoryId));
    return category ? category.name : "Unknown Category";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'declined':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const allJobs = [...pendingJobs, ...approvedJobs, ...declinedJobs];
  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(job.category).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md rounded-lg">
        <table className="w-[1200px] lg:w-full divide-y divide-gray-700">
          <thead>
            <tr className="bg-gray-700">
              <th className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
              <th className="w-52 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
              <th className="w-36 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
              <th className="w-36 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
              <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
              <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="w-36 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredJobs.map((job) => (
              <tr key={job._id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative group isolate">
                    {/* Thumbnail container */}
                    <div className="w-16 h-16 overflow-hidden rounded-lg bg-gray-700 relative z-10">
                      {job.images ? (
                        <img
                          src={`http://localhost:5000${job.images}`}
                          alt={job.title}
                          className="w-full h-16 object-cover transition-all duration-300 
                            group-hover:scale-110 group-hover:rotate-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Enlarged preview - fixed positioning */}
                    <div className="hidden group-hover:block fixed z-[9999] 
                      shadow-[0_0_30px_rgba(16,185,129,0.5)]
                      transform transition-all duration-300 ml-4">
                      <div className="bg-gray-800/90 p-2 rounded-lg backdrop-blur-sm">
                        {job.images ? (
                          <img
                            src={`http://localhost:5000${job.images}`}
                            alt={job.title}
                            className="w-48 h-48 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-48 h-48 rounded-lg bg-gray-700 flex items-center justify-center text-gray-500">
                            No Image Available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white max-w-[180px] truncate" title={job.title}>
                    {job.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">{getCategoryName(job.category)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400 max-w-[144px] truncate" title={`${job.location}, ${job.district}`}>
                    {job.location}, {job.district}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-emerald-500">Rs. {job.payment}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setIsStatusModalOpen(true);
                      }}
                      className="text-emerald-500 hover:text-emerald-400"
                      title="Change Status"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="text-red-500 hover:text-red-400"
                      title="Delete Job"
                    >
                      <Trash2 size={20} />
                    </button>
                    {job.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(job._id)}
                          className="text-green-500 hover:text-green-400"
                          title="Approve Job"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() => handleDecline(job._id)}
                          className="text-red-500 hover:text-red-400"
                          title="Decline Job"
                        >
                          <X size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Change Modal */}
      {isStatusModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg w-80 shadow-xl">
            <h3 className="text-lg font-semibold mb-3 text-white">Change Job Status</h3>
            <p className="text-sm text-gray-400 mb-3">Current status: {selectedJob.status}</p>
            
            <div className="space-y-2">
              <button
                onClick={() => handleStatusChange(selectedJob._id, 'pending')}
                className="w-full px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
              >
                Set to Pending
              </button>
              <button
                onClick={() => handleStatusChange(selectedJob._id, 'approved')}
                className="w-full px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
              >
                Set to Approved
              </button>
              <button
                onClick={() => handleStatusChange(selectedJob._id, 'declined')}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Set to Declined
              </button>
            </div>
            
            <button
              onClick={() => {
                setIsStatusModalOpen(false);
                setSelectedJob(null);
              }}
              className="w-full mt-3 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApprovalTab;