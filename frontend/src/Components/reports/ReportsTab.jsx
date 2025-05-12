import { useUserStore } from '../../stores/useUserStore';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
// Import jsPDF and autotable correctly
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

            const response = await axios.get(`/reports/${endpoint}`);
            console.log('Data received:', response.data);

            if (format === 'pdf') {
                const doc = new jsPDF('l', 'mm', 'a4');
                
                // Add title
                doc.setFontSize(20);
                doc.text(endpoint.includes('user/') ? 'User Activity Report' : endpoint.split('/')[1].toUpperCase() + ' Report', 15, 15);
                
                // Add date
                doc.setFontSize(10);
                doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 25);

                if (endpoint.includes('user/')) {
                    // Handle single user report (nested structure)
                    let yPosition = 35;
                    
                    // Loop through each section
                    Object.entries(response.data).forEach(([section, data]) => {
                        // Add section header
                        doc.setFontSize(14);
                        doc.text(section, 15, yPosition);
                        yPosition += 10;

                        // Create table for section data
                        autoTable(doc, {
                            head: [['Field', 'Value']],
                            body: Object.entries(data),
                            startY: yPosition,
                            theme: 'grid',
                            styles: {
                                fontSize: 8,
                                cellPadding: 2
                            },
                            headStyles: {
                                fillColor: [41, 128, 185],
                                textColor: 255
                            },
                            alternateRowStyles: {
                                fillColor: [245, 245, 245]
                            }
                        });

                        yPosition = doc.lastAutoTable.finalY + 15;
                    });
                } else {
                    // Handle admin reports (flat structure)
                    autoTable(doc, {
                        head: [Object.keys(response.data[0])],
                        body: response.data.map(item => Object.values(item)),
                        startY: 30,
                        theme: 'grid',
                        styles: {
                            fontSize: 8,
                            cellPadding: 2
                        },
                        headStyles: {
                            fillColor: [41, 128, 185],
                            textColor: 255
                        },
                        alternateRowStyles: {
                            fillColor: [245, 245, 245]
                        }
                    });
                }

                // Save the PDF
                doc.save(`${endpoint.replace('/', '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
                toast.success('PDF generated successfully');
            } else {
                // Handle CSV download - flatten nested structure for user report
                let csvData;
                if (endpoint.includes('user/')) {
                    csvData = Object.entries(response.data).flatMap(([section, data]) =>
                        Object.entries(data).map(([field, value]) => ({
                            Section: section,
                            Field: field,
                            Value: value
                        }))
                    );
                } else {
                    csvData = response.data;
                }

                const blob = new Blob([JSON.stringify(csvData)], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${endpoint.replace('/', '-')}-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success('CSV downloaded successfully');
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to generate report');
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
            title: 'Bookings Report',
            description: 'Details of all bookings, their statuses, and participants',
            endpoint: 'admin/bookings'
        },
        {
            title: 'Payments Report',
            description: 'Summary of all financial transactions and payment statuses',
            endpoint: 'admin/payments'
        },
        {
            title: 'Reviews Report',
            description: 'Summary of all user reviews and ratings for completed bookings',
            endpoint: 'admin/reviews'
        }
    ] : [
        {
            title: 'My Activity Report',
            description: 'Your personal activity summary including bookings and payments',
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