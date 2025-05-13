import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

const UserReports = ({ userId }) => {
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('30d');
    const [format, setFormat] = useState('json');

    const timeRanges = [
        { id: '7d', label: 'Last 7 Days' },
        { id: '30d', label: 'Last 30 Days' },
        { id: '90d', label: 'Last 90 Days' },
        { id: '1y', label: 'Last Year' }
    ];

    const handleGenerateReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/reports/user/${userId}`, {
                params: {
                    timeRange,
                    format
                },
                responseType: format === 'csv' ? 'blob' : 'json'
            });

            if (format === 'csv') {
                try {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `user-${userId}-report-${timeRange}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url); // Clean up
                } catch (error) {
                    console.error('Error downloading CSV:', error);
                    toast.error('Failed to download report');
                }
            } else {
                // Handle JSON display
                if (response.data.success) {
                    toast.success('Report generated successfully');
                    console.log('Report data:', response.data.data);
                } else {
                    throw new Error(response.data.message);
                }
            }
        } catch (error) {
            console.error('Error generating user report:', error);
            toast.error(error.response?.data?.message || 'Error generating report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Generate Your Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Time Range Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Time Range
                    </label>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {timeRanges.map(range => (
                            <option key={range.id} value={range.id}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Format Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Format
                    </label>
                    <div className="flex gap-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="json"
                                checked={format === 'json'}
                                onChange={(e) => setFormat(e.target.value)}
                                className="text-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-white">JSON</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="csv"
                                checked={format === 'csv'}
                                onChange={(e) => setFormat(e.target.value)}
                                className="text-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-white">CSV</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            >
                {loading ? (
                    <>
                        <FileText className="animate-spin" size={20} />
                        Generating...
                    </>
                ) : (
                    <>
                        <Download size={20} />
                        Generate Report
                    </>
                )}
            </button>
        </div>
    );
};

export default UserReports;