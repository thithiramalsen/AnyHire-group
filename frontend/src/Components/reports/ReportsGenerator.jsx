import { Download } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';

const ReportGenerator = ({ endpoint, type = 'pdf', buttonText, className }) => {
    const generateReport = async () => {
        try {
            const response = await axios({
                url: `/reports/${endpoint}?format=${type}`,
                method: 'GET',
                responseType: 'arraybuffer',
                headers: {
                    'Accept': type === 'pdf' ? 'application/pdf' : 'text/csv'
                }
            });

            // Convert array buffer to blob with correct type
            const blob = new Blob([response.data], {
                type: type === 'pdf' ? 'application/pdf' : 'text/csv'
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${endpoint.replace('/', '-')}-report.${type}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Report generated successfully');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        }
    };

    return (
        <button
            onClick={generateReport}
            className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg 
                hover:bg-emerald-700 transition-colors ${className}`}
        >
            <Download className="w-4 h-4" />
            {buttonText || 'Generate Report'}
        </button>
    );
};

export default ReportGenerator;