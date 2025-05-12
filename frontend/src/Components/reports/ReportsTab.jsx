import { useUserStore } from '../../stores/useUserStore';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

const ReportCard = ({ title, description, onDownloadPDF, onDownloadCSV, loading }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <div className="flex space-x-3">
            <button
                onClick={onDownloadPDF}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg 
                    hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
                <FileText className="w-4 h-4" />
                PDF
            </button>
            <button
                onClick={onDownloadCSV}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                    hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
            </button>
        </div>
    </div>
);

const ReportsTab = () => {
    const { user } = useUserStore();
    const [loading, setLoading] = useState(false);
    const isAdmin = user?.role === 'admin';

    const handleDownload = async (endpoint, format) => {
        try {
            setLoading(true);
            console.log('Download request initiated:', { endpoint, format });

            const requestConfig = {
                url: `/reports/${endpoint}?format=${format}`,
                method: 'GET',
                responseType: 'arraybuffer',
                headers: {
                    'Accept': format === 'pdf' ? 'application/pdf' : 'text/csv',
                    'Content-Type': format === 'pdf' ? 'application/pdf' : 'text/csv'
                }
            };

            console.log('Axios request config:', requestConfig);

            const response = await axios(requestConfig);

            console.log('Response received:', {
                status: response.status,
                headers: response.headers,
                dataType: typeof response.data,
                dataLength: response.data?.byteLength
            });

            // Check if we got actual data
            if (!response.data || response.data.byteLength === 0) {
                console.error('Empty response data detected');
                throw new Error('No data received from server');
            }

            const contentType = format === 'pdf' ? 'application/pdf' : 'text/csv';
            console.log('Creating blob with content type:', contentType);
            
            const blob = new Blob([new Uint8Array(response.data)], { type: contentType });
            console.log('Blob created:', {
                size: blob.size,
                type: blob.type
            });

            if (blob.size === 0) {
                console.error('Empty blob created');
                throw new Error('Empty file received');
            }

            const url = window.URL.createObjectURL(blob);
            console.log('Blob URL created:', url);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${endpoint.replace('/', '-')}-${new Date().toISOString().split('T')[0]}.${format}`;
            
            console.log('Download link created:', {
                href: link.href,
                download: link.download
            });

            if (format === 'pdf') {
                console.log('Opening PDF in new window');
                window.open(url, '_blank');
            } else {
                console.log('Triggering direct download');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            window.URL.revokeObjectURL(url);
            console.log('Blob URL revoked');

            toast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Download error full details:', error);
            console.error('Error stack:', error.stack);
            console.error('Response if available:', error.response);
            console.error('Request if available:', error.request);
            console.error('Config if available:', error.config);
            toast.error(error.message || 'Failed to download report');
        } finally {
            setLoading(false);
        }
    };

    const reports = isAdmin ? [
        {
            title: 'Users Report',
            description: 'Comprehensive report of all user data and statistics',
            endpoint: 'admin/users'
        },
        {
            title: 'Jobs Report',
            description: 'Overview of all jobs and their performance metrics',
            endpoint: 'admin/jobs'
        },
        {
            title: 'Bookings Report',
            description: 'Details of all bookings and their statuses',
            endpoint: 'admin/bookings'
        },
        {
            title: 'Payments Report',
            description: 'Summary of all financial transactions',
            endpoint: 'admin/payments'
        }
    ] : [
        {
            title: 'My Activity Report',
            description: 'Your personal activity summary and statistics',
            endpoint: `user/${user?._id}`
        }
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">
                {isAdmin ? 'System Reports' : 'My Reports'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <ReportCard
                        key={report.endpoint}
                        title={report.title}
                        description={report.description}
                        onDownloadPDF={() => handleDownload(report.endpoint, 'pdf')}
                        onDownloadCSV={() => handleDownload(report.endpoint, 'csv')}
                        loading={loading}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReportsTab;