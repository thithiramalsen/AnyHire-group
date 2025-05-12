import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Rating from '../models/review.model.js';
import Support from '../models/ticket.model.js';
import { getDateRange } from '../controllers/analytics.controller.js';
import PDFDocument from 'pdfkit';

class ReportGeneratorService {
    // Users Report
    static async generateUsersReport(timeRange = '30d', format = 'json', userId = null) {
        const { startDate, endDate } = getDateRange(timeRange);
        
        const query = {
            createdAt: { $gte: startDate, $lte: endDate }
        };
        
        if (userId) {
            query._id = userId;
        }

        const users = await User.find(query)
            .select('-password -refreshToken')
            .lean();

        const report = {
            generatedAt: new Date(),
            timeRange,
            totalUsers: users.length,
            users: users.map(user => ({
                name: user.name,
                email: user.email,
                role: user.role,
                registrationDate: user.createdAt,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin
            }))
        };

        return format === 'csv' ? this.convertToCSV(report) : report;
    }

    // Jobs Report
    static async generateJobsReport(timeRange = '30d', format = 'json') {
        const { startDate, endDate } = getDateRange(timeRange);
        
        const jobs = await Job.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('userId', 'name email');

        const report = {
            generatedAt: new Date(),
            timeRange,
            totalJobs: jobs.length,
            jobs: jobs.map(job => ({
                title: job.title,
                category: job.category,
                status: job.status,
                postedBy: {
                    name: job.userId.name,
                    email: job.userId.email
                },
                createdAt: job.createdAt,
                budget: job.budget
            }))
        };

        return format === 'csv' ? this.convertToCSV(report) : report;
    }

    // Bookings Report
    static async generateBookingsReport(timeRange = '30d', format = 'json') {
        const { startDate, endDate } = getDateRange(timeRange);
        
        const bookings = await Booking.find({
            createdAt: { $gte: startDate, $lte: endDate }
        })
        .populate('jobId', 'title category')
        .populate('customerId', 'name email')
        .populate('seekerId', 'name email');

        const report = {
            generatedAt: new Date(),
            timeRange,
            totalBookings: bookings.length,
            bookings: bookings.map(booking => ({
                jobTitle: booking.jobId.title,
                category: booking.jobId.category,
                customer: {
                    name: booking.customerId.name,
                    email: booking.customerId.email
                },
                seeker: {
                    name: booking.seekerId.name,
                    email: booking.seekerId.email
                },
                status: booking.status,
                createdAt: booking.createdAt,
                completedAt: booking.completedAt
            }))
        };

        return format === 'csv' ? this.convertToCSV(report) : report;
    }

    // Payments Report
    static async generatePaymentsReport(timeRange = '30d', format = 'json') {
        const { startDate, endDate } = getDateRange(timeRange);
        
        const payments = await Payment.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('bookingId');

        const report = {
            generatedAt: new Date(),
            timeRange,
            totalPayments: payments.length,
            totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
            payments: payments.map(payment => ({
                bookingId: payment.bookingId._id,
                amount: payment.amount,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                createdAt: payment.createdAt,
                completedAt: payment.completedAt
            }))
        };

        return format === 'csv' ? this.convertToCSV(report) : report;
    }

    // Ratings Report
    static async generateRatingsReport(timeRange = '30d', format = 'json') {
        const { startDate, endDate } = getDateRange(timeRange);
        
        const ratings = await Rating.find({
            createdAt: { $gte: startDate, $lte: endDate }
        })
        .populate('reviewerId', 'name email')
        .populate('revieweeId', 'name email');

        const report = {
            generatedAt: new Date(),
            timeRange,
            totalRatings: ratings.length,
            averageRating: ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length,
            ratings: ratings.map(rating => ({
                reviewer: {
                    name: rating.reviewerId.name,
                    email: rating.reviewerId.email
                },
                reviewee: {
                    name: rating.revieweeId.name,
                    email: rating.revieweeId.email
                },
                rating: rating.rating,
                comment: rating.comment,
                createdAt: rating.createdAt
            }))
        };

        return format === 'csv' ? this.convertToCSV(report) : report;
    }

    // Support Report
    static async generateSupportReport(timeRange = '30d', format = 'json') {
        const { startDate, endDate } = getDateRange(timeRange);
        
        const tickets = await Support.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('userId', 'name email');

        const report = {
            generatedAt: new Date(),
            timeRange,
            totalTickets: tickets.length,
            tickets: tickets.map(ticket => ({
                user: {
                    name: ticket.userId.name,
                    email: ticket.userId.email
                },
                category: ticket.category,
                status: ticket.status,
                priority: ticket.priority,
                createdAt: ticket.createdAt,
                resolvedAt: ticket.resolvedAt
            }))
        };

        return format === 'csv' ? this.convertToCSV(report) : report;
    }

    // Helper method to convert JSON to CSV
    static convertToCSV(jsonData) {
        // Handle the case where jsonData is an object with nested arrays
        const dataArray = Array.isArray(jsonData) ? jsonData : jsonData.users || jsonData.jobs || 
                         jsonData.bookings || jsonData.payments || jsonData.ratings || jsonData.tickets || [];
        
        if (!dataArray.length) return '';

        // Get all possible headers from all objects
        const headers = [...new Set(dataArray.reduce((keys, obj) => {
            return keys.concat(Object.keys(obj));
        }, []))];

        // Create CSV rows
        const csvRows = [
            headers.join(','), // Header row
            ...dataArray.map(row => 
                headers.map(header => {
                    let cell = row[header];
                    // Handle nested objects
                    if (typeof cell === 'object' && cell !== null) {
                        cell = JSON.stringify(cell).replace(/"/g, '""');
                    }
                    // Handle undefined/null values
                    if (cell === undefined || cell === null) {
                        cell = '';
                    }
                    // Escape commas and quotes
                    return `"${cell}"`;
                }).join(',')
            )
        ];

        return csvRows.join('\n');
    }

    static async generatePDF(data, reportType) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Add title
                doc.fontSize(20)
                   .text(`${reportType.toUpperCase()} REPORT`, {
                       align: 'center',
                       underline: true
                   })
                   .moveDown();

                // Add timestamp
                doc.fontSize(12)
                   .text(`Generated on: ${new Date().toLocaleString()}`)
                   .moveDown();

                // Extract the data array based on report type
                const dataArray = data[reportType.toLowerCase()] || [];
                
                if (dataArray.length > 0) {
                    // Get headers from the first object
                    const headers = Object.keys(dataArray[0]);
                    
                    // Calculate column widths
                    const pageWidth = doc.page.width - 100; // margins
                    const columnWidth = pageWidth / headers.length;
                    
                    // Draw table header
                    doc.fontSize(10);
                    let yPos = doc.y;
                    let xPos = 50;
                    
                    // Draw header background
                    doc.rect(xPos, yPos, pageWidth, 20)
                       .fill('#f0f0f0');
                    
                    // Draw header text
                    headers.forEach((header, i) => {
                        doc.fillColor('black')
                           .text(
                               header.charAt(0).toUpperCase() + header.slice(1),
                               xPos + (i * columnWidth),
                               yPos + 5,
                               {
                                   width: columnWidth,
                                   align: 'center'
                               }
                           );
                    });
                    
                    // Draw table rows
                    yPos += 20;
                    dataArray.forEach((row, rowIndex) => {
                        // Alternate row background
                        if (rowIndex % 2 === 0) {
                            doc.rect(xPos, yPos, pageWidth, 20)
                               .fill('#fafafa');
                        }
                        
                        // Draw row data
                        headers.forEach((header, i) => {
                            let value = row[header];
                            // Handle nested objects and arrays
                            if (typeof value === 'object' && value !== null) {
                                value = JSON.stringify(value);
                            }
                            
                            doc.fillColor('black')
                               .text(
                                   value || '',
                                   xPos + (i * columnWidth),
                                   yPos + 5,
                                   {
                                       width: columnWidth,
                                       align: 'center',
                                       lineBreak: false,
                                       ellipsis: true
                                   }
                               );
                        });
                        
                        yPos += 20;
                        
                        // Add new page if needed
                        if (yPos > doc.page.height - 50) {
                            doc.addPage();
                            yPos = 50;
                        }
                    });
                } else {
                    // No data message
                    doc.fontSize(12)
                       .text('No data available for this report.', {
                           align: 'center'
                       });
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    static async generateReport(reportType, timeRange, format) {
        let data;
        switch (reportType) {
            case 'users':
                data = await this.generateUsersReport(timeRange);
                break;
            // ...existing cases...
        }

        switch (format) {
            case 'json':
                return data;
            case 'csv':
                return this.convertToCSV(data);
            case 'pdf':
                return this.generatePDF(data, reportType);
            default:
                throw new Error('Unsupported format');
        }
    }
}

export default ReportGeneratorService;