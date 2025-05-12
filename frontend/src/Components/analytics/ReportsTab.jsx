import { useState } from 'react';
import { Download, FileText, Users, BarChart, Calendar, CreditCard, Star, HelpCircle } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';

const ReportsTab = () => {
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState('users');
    const [timeRange, setTimeRange] = useState('30d');
    const [format, setFormat] = useState('json');

    const reportTypes = [
        { id: 'users', label: 'Users Report' },
        { id: 'jobs', label: 'Jobs Report' },
        { id: 'bookings', label: 'Bookings Report' },
        { id: 'payments', label: 'Payments Report' },
        { id: 'ratings', label: 'Ratings Report' },
        { id: 'support', label: 'Support Report' }
    ];

    const timeRanges = [
        { id: '7d', label: 'Last 7 Days' },
        { id: '30d', label: 'Last 30 Days' },
        { id: '90d', label: 'Last 90 Days' },
        { id: '1y', label: 'Last Year' }
    ];

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/reports/generate', {
                params: {
                    reportType: selectedReport,
                    timeRange,
                    format
                },
                responseType: format === 'json' ? 'json' : 'blob'
            });

            const blob = new Blob([response.data], { 
                type: format === 'csv' 
                    ? 'text/csv' 
                    : format === 'pdf'
                        ? 'application/pdf'
                        : 'application/json'
            });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${selectedReport}-report-${timeRange}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Report downloaded successfully!');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(error.response?.data?.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Generate Reports</h2>
                
                {/* Report Generation Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Report Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Report Type
                        </label>
                        <select
                            value={selectedReport}
                            onChange={(e) => setSelectedReport(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {reportTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

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
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="pdf"
                                    checked={format === 'pdf'}
                                    onChange={(e) => setFormat(e.target.value)}
                                    className="text-blue-500 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-white">PDF</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
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
        </div>
    );
};

export default ReportsTab;