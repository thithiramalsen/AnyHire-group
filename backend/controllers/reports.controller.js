import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import Ticket from '../models/ticket.model.js';
import Review from '../models/review.model.js';
import Contact from '../models/contact.model.js'; 

const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
};

const calculateUserEarnings = async (userId) => {
    try {
        console.log('Calculating earnings for user:', userId);

        // Convert userId to Number if it's a string
        const userIdNum = Number(userId);
        console.log('Converted userId to Number:', userIdNum);

        const payments = await Payment.aggregate([
            {
                $match: {
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookingId',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            {
                $unwind: '$booking'
            },
            {
                $match: {
                    $or: [
                        { 'booking.seekerId': userIdNum },  // Use numeric ID
                        { 'booking.posterId': userIdNum }   // Use numeric ID
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: {
                        $sum: {
                            $cond: [
                                { $eq: ['$booking.seekerId', userIdNum] },  // Use numeric ID
                                '$amount',
                                0
                            ]
                        }
                    },
                    totalPayments: {
                        $sum: {
                            $cond: [
                                { $eq: ['$booking.posterId', userIdNum] },  // Use numeric ID
                                '$amount',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        console.log('Raw payments aggregation result:', payments);

        const result = {
            totalEarnings: payments[0]?.totalEarnings || 0,
            totalPayments: payments[0]?.totalPayments || 0,
            netEarnings: (payments[0]?.totalEarnings || 0) - (payments[0]?.totalPayments || 0)
        };

        console.log('Final earnings calculation result:', result);
        return result;
    } catch (error) {
        console.error('Error calculating user earnings:', error);
        console.error('Error details:', error.message);
        return {
            totalEarnings: 0,
            totalPayments: 0,
            netEarnings: 0
        };
    }
};

export const generateUsersReport = async (req, res) => {
    try {
        console.log('Report generation started');
        console.log('Request format:', req.query.format);

        const { format = 'pdf' } = req.query;
        
        // Fetch all users with relevant data
        const users = await User.find({}, '-password').lean();
        
        // Get additional statistics for each user
        const enhancedUsers = await Promise.all(users.map(async (user) => {
            // Get user's financial data
            const earnings = await calculateUserEarnings(user._id);
            console.log(`Financial data for user ${user._id}:`, earnings);

            // Get other statistics
            const jobsPosted = await Job.countDocuments({ createdBy: user._id });
            const jobsApplied = await Booking.countDocuments({ seekerId: user._id });
            const jobsCompleted = await Booking.countDocuments({ 
                seekerId: user._id, 
                status: { $in: ['completed', 'paid'] }
            });

            const successRate = jobsApplied > 0 
                ? ((jobsCompleted / jobsApplied) * 100).toFixed(1) 
                : 0;

            return {
                ID: user._id,
                Name: user.name || 'N/A',
                Email: user.email || 'N/A',
                Role: user.role || 'N/A',
                'Join Date': formatDate(user.createdAt),
                'Last Active': formatDate(user.lastActive),
                'District': user.preferredDistrict || 'N/A',
                'Jobs Posted': jobsPosted,
                'Jobs Applied': jobsApplied,
                'Jobs Completed': jobsCompleted,
                'Success Rate': `${successRate}%`,
                'Total Earnings': earnings.totalEarnings,
                'Total Spent': earnings.totalPayments,
                'Net Balance': earnings.netEarnings
            };
        }));

        if (format === 'csv') {
            const fields = [
                'ID', 'Name', 'Email', 'Role', 'Join Date', 'Last Active',
                'District', 'Jobs Posted', 'Jobs Applied', 'Jobs Completed',
                'Success Rate', 'Total Earnings', 'Total Spent', 'Net Balance'
            ];
            
            const parser = new Parser({ fields });
            const csv = parser.parse(enhancedUsers);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=users-report.csv');
            return res.send(csv);
        }

        if (format === 'pdf') {
            console.log('Generating PDF report');
            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
            
            console.log('Setting response headers');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=users-report.pdf');
            
            console.log('Piping document to response');
            doc.pipe(res);

            // Add title
            doc.fontSize(20)
               .text('Users Report', { align: 'center' })
               .moveDown();

            // Add generation date
            doc.fontSize(12)
               .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' })
               .moveDown();

            // Add summary statistics
            doc.fontSize(14)
               .text('Summary Statistics')
               .fontSize(12)
               .text(`Total Users: ${users.length}`)
               .text(`Customers: ${users.filter(u => u.role === 'customer').length}`)
               .text(`Job Seekers: ${users.filter(u => u.role === 'jobSeeker').length}`)
               .text(`Admins: ${users.filter(u => u.role === 'admin').length}`)
               .moveDown();

            // Create table
            const tableTop = 200;
            const colWidths = {
                id: 40,
                name: 100,
                email: 120,
                role: 70,
                joinDate: 80,
                district: 80,
                stats: 150,    // Increased width for activity stats
                financial: 150  // Increased width for financial stats
            };

            const rowHeight = 60;  // Increased from 40 to give more vertical space

            // Table headers
            let currentX = 30;
            doc.font('Helvetica-Bold');
            Object.entries({
                'ID': colWidths.id,
                'Name': colWidths.name,
                'Email': colWidths.email,
                'Role': colWidths.role,
                'Join Date': colWidths.joinDate,
                'District': colWidths.district,
                'Activity': colWidths.stats,
                'Financial': colWidths.financial
            }).forEach(([header, width]) => {
                doc.text(header, currentX, tableTop);
                currentX += width;
            });

            // Table rows
            let yPosition = tableTop + 20;
            doc.font('Helvetica');

            enhancedUsers.forEach((user) => {
                // Add new page if needed
                if (yPosition > 500) {
                    doc.addPage();
                    yPosition = 50;
                    
                    // Add headers on new page
                    currentX = 30;
                    doc.font('Helvetica-Bold');
                    Object.entries({
                        'ID': colWidths.id,
                        'Name': colWidths.name,
                        'Email': colWidths.email,
                        'Role': colWidths.role,
                        'Join Date': colWidths.joinDate,
                        'District': colWidths.district,
                        'Activity': colWidths.stats,
                        'Financial': colWidths.financial
                    }).forEach(([header, width]) => {
                        doc.text(header, currentX, yPosition, { width });
                        currentX += width;
                    });
                    yPosition += 20;
                    doc.font('Helvetica');
                }

                currentX = 30;
                const baseY = yPosition;  // Store the base Y position for this row
                
                // Basic info (single line items)
                doc.text(String(user.ID), currentX, baseY, { width: colWidths.id });
                currentX += colWidths.id;
                
                doc.text(user.Name, currentX, baseY, { width: colWidths.name });
                currentX += colWidths.name;
                
                doc.text(user.Email, currentX, baseY, { width: colWidths.email });
                currentX += colWidths.email;
                
                doc.text(user.Role, currentX, baseY, { width: colWidths.role });
                currentX += colWidths.role;
                
                doc.text(user['Join Date'], currentX, baseY, { width: colWidths.joinDate });
                currentX += colWidths.joinDate;
                
                doc.text(user.District, currentX, baseY, { width: colWidths.district });
                currentX += colWidths.district;
                
                // Activity stats (multiple lines with proper spacing)
                const activityStats = [
                    `Posted: ${user['Jobs Posted']}`,
                    `Applied: ${user['Jobs Applied']}`,
                    `Completed: ${user['Jobs Completed']}`,
                    `Success: ${user['Success Rate']}`
                ];
                
                doc.text(activityStats.join('\n'), currentX, baseY, {
                    width: colWidths.stats,
                    lineGap: 2  // Add some space between lines
                });
                currentX += colWidths.stats;

                // Financial stats (multiple lines with proper spacing)
                const financialStats = [
                    `Earned: $${user['Total Earnings']}`,
                    `Spent: $${user['Total Spent']}`,
                    `Net: $${user['Net Balance']}`
                ];
                
                doc.text(financialStats.join('\n'), currentX, baseY, {
                    width: colWidths.financial,
                    lineGap: 2  // Add some space between lines
                });

                // Add a light grey line between rows
                const lineY = baseY + rowHeight - 5;
                doc.strokeColor('#e0e0e0')
                   .moveTo(30, lineY)
                   .lineTo(830, lineY)  // Adjust end point based on total table width
                   .stroke();

                yPosition += rowHeight;  // Move to next row
            });

            // Add some styling to make the table more attractive
            doc.strokeColor('#000000')  // Reset stroke color for any subsequent drawing
               .lineWidth(0.5);        // Reset line width

            // Draw table outline
            doc.rect(30, tableTop - 5, 800, yPosition - tableTop + 5).stroke();  // Adjust width based on total table width

            // Add alternating row colors (optional)
            let isEvenRow = false;
            enhancedUsers.forEach((_, index) => {
                if (isEvenRow) {
                    doc.fillColor('#f8f8f8')
                       .rect(30, tableTop + 20 + (index * rowHeight), 800, rowHeight)
                       .fill();
                }
                isEvenRow = !isEvenRow;
            });

            // Add total summary at the bottom
            const totalEarnings = enhancedUsers.reduce((sum, user) => sum + user['Total Earnings'], 0);
            const totalSpent = enhancedUsers.reduce((sum, user) => sum + user['Total Spent'], 0);
            const totalNet = enhancedUsers.reduce((sum, user) => sum + user['Net Balance'], 0);

            doc.moveDown(2);
            doc.fontSize(14).text('Platform Financial Summary', { underline: true });
            doc.fontSize(12);
            doc.text(`Total Platform Earnings: $${totalEarnings}`);
            doc.text(`Total Platform Spending: $${totalSpent}`);
            doc.text(`Total Platform Net: $${totalNet}`);

            console.log('Ending PDF document');
            doc.end();
        }
    } catch (error) {
        console.error('Report generation error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating report' 
        });
    }
};

// The rest of the file remains unchanged.
export const generateUserReport = async (req, res) => {
    try {
        const { format = 'pdf' } = req.query;
        const userId = req.params.userId;

        // Verify user has permission to access this report
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access this report' });
        }

        // Fetch user data
        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user statistics with updated earnings calculation
        const jobsPosted = await Job.countDocuments({ createdBy: userId });
        const jobsApplied = await Booking.countDocuments({ seekerId: userId });
        const jobsCompleted = await Booking.countDocuments({ 
            seekerId: userId, 
            status: { $in: ['completed', 'paid'] }
        });
        
        // Use the new earnings calculation function
        const earningsData = await calculateUserEarnings(userId);
        console.log('Earnings data before PDF generation:', earningsData);

        // Calculate success rate
        const successRate = jobsApplied > 0 
            ? ((jobsCompleted / jobsApplied) * 100).toFixed(1) 
            : 0;

        const userData = {
            'Personal Information': {
                'Name': user.name || 'N/A',
                'Email': user.email || 'N/A',
                'Role': user.role || 'N/A',
                'District': user.preferredDistrict || 'N/A',
                'Member Since': formatDate(user.createdAt),
                'Last Active': formatDate(user.lastActive)
            },
            'Activity Statistics': {
                'Jobs Posted': jobsPosted,
                'Jobs Applied': jobsApplied,
                'Jobs Completed': jobsCompleted,
                'Success Rate': `${successRate}%`
            },
            'Financial Summary': {
                'Total Earnings': `$${earningsData.totalEarnings}`,
                'Total Payments': `$${earningsData.totalPayments}`,
                'Net Earnings': `$${earningsData.netEarnings}`
            }
        };

        console.log('userData object for PDF:', userData);

        if (format === 'csv') {
            const flatData = {
                ...userData['Personal Information'],
                ...userData['Activity Statistics'],
                ...userData['Financial Summary']
            };
            
            const fields = Object.keys(flatData);
            const parser = new Parser({ fields });
            const csv = parser.parse([flatData]);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=user-report-${userId}.csv`);
            return res.send(csv);
        }

        // Generate PDF
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=user-report-${userId}.pdf`);
            doc.pipe(res);

        // Title and Header
        doc.fontSize(24)
           .fillColor('#2563eb')  // Blue color for title
           .text('User Report', { align: 'center' })
           .moveDown();

        // Generation date with better formatting
        doc.fontSize(12)
           .fillColor('#666666')  // Gray color for date
           .text(`Generated on: ${formatDate(new Date())}`, { align: 'right' })
           .moveDown()
           .fillColor('#000000');  // Reset to black

        // Draw sections with better styling
        Object.entries(userData).forEach(([section, data]) => {
            // Section header with background
            doc.fillColor('#f3f4f6')
               .rect(50, doc.y, 495, 30)
               .fill();
            
            doc.fillColor('#1f2937')
               .fontSize(16)
               .text(section, 60, doc.y - 25, {
                   bold: true
               })
               .moveDown(0.5);

            // Section content with grid layout
            doc.fontSize(12);
            const entries = Object.entries(data);
            const startY = doc.y;
            let maxY = startY;

            // Create two columns
            entries.forEach(([key, value], index) => {
                const x = index % 2 === 0 ? 70 : 320;
                const y = startY + Math.floor(index / 2) * 25;
                
                doc.fillColor('#4b5563')
                   .text(key + ':', x, y);
                   
                doc.fillColor('#000000')
                   .text(value.toString(), x + 100, y);
                
                maxY = Math.max(maxY, y + 25);
            });

            doc.y = maxY + 20;  // Add padding after section
        });

        // Recent Activity Section with better styling
        const recentBookings = await Booking.find({
            $or: [{ seekerId: userId }, { posterId: userId }]
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('jobId', 'title')
        .lean();

        if (recentBookings.length > 0) {
            // Activity header with background
            doc.fillColor('#f3f4f6')
               .rect(50, doc.y, 495, 30)
               .fill();
               
            doc.fillColor('#1f2937')
               .fontSize(16)
               .text('Recent Activity', 60, doc.y - 25)
               .moveDown(0.5);

            // Activity table
            doc.fontSize(12);
            const tableTop = doc.y;
            const colWidths = {
                date: 100,
                job: 250,
                status: 100
            };

            // Table headers
            doc.fillColor('#4b5563');
            doc.text('Date', 70, tableTop);
            doc.text('Job Title', 170, tableTop);
            doc.text('Status', 420, tableTop);

            // Table rows
            doc.fillColor('#000000');
            recentBookings.forEach((booking, index) => {
                const rowY = tableTop + 25 + (index * 25);
                
                // Add zebra striping
                if (index % 2 === 1) {
                    doc.fillColor('#f9fafb')
                       .rect(70, rowY - 5, 450, 25)
                       .fill()
                       .fillColor('#000000');
                }

                doc.text(formatDate(booking.createdAt), 70, rowY);
                doc.text(booking.jobId?.title || 'N/A', 170, rowY);
                doc.text(booking.status, 420, rowY);
            });

            doc.y = tableTop + (recentBookings.length + 1) * 25 + 20;
        }

        // Add footer with page number
        doc.fontSize(10)
           .fillColor('#666666')
           .text(
               'Page 1 of 1',
               0,
               doc.page.height - 50,
               { align: 'center' }
           );

        doc.end();
    } catch (error) {
        console.error('Error generating user report:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating report' 
        });
    }
};

//Job Reports
export const generateJobsReport = async (req, res) => {
    try {
        const { format = 'pdf' } = req.query;
        
        // Fetch all jobs with relevant data
        const jobs = await Job.find().lean();
        
        // Get additional statistics for each job
        const enhancedJobs = await Promise.all(jobs.map(async (job) => {
            // Get booking statistics
            const totalApplications = await Booking.countDocuments({ 
                jobId: job._id 
            });
            
            const completedBookings = await Booking.countDocuments({ 
                jobId: job._id,
                status: { $in: ['completed', 'paid'] }
            });

            // Get payment information
            const payments = await Payment.aggregate([
                {
                    $match: {
                        status: { $in: ['confirmed', 'completed'] }
                    }
                },
                {
                    $lookup: {
                        from: 'bookings',
                        localField: 'bookingId',
                        foreignField: '_id',
                        as: 'booking'
                    }
                },
                {
                    $unwind: '$booking'
                },
                {
                    $match: {
                        'booking.jobId': job._id
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ]);

            const poster = await User.findById(job.createdBy);
            const successRate = totalApplications > 0 
                ? ((completedBookings / totalApplications) * 100).toFixed(1) 
                : 0;

            return {
                'ID': job._id,
                'Title': job.title,
                'Category': job.category,
                'District': job.district,
                'Posted By': poster?.name || 'N/A',
                'Posted Date': formatDate(job.postedDate),
                'Deadline': formatDate(job.deadline),
                'Status': job.status,
                'Payment Amount': `$${job.payment}`,
                'Applications': totalApplications,
                'Completed': completedBookings,
                'Success Rate': `${successRate}%`,
                'Total Earnings': `$${payments[0]?.totalAmount || 0}`
            };
        }));

        if (format === 'csv') {
            const fields = [
                'ID', 'Title', 'Category', 'District', 'Posted By', 
                'Posted Date', 'Deadline', 'Status', 'Payment Amount',
                'Applications', 'Completed', 'Success Rate', 'Total Earnings'
            ];
            
            const parser = new Parser({ fields });
            const csv = parser.parse(enhancedJobs);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=jobs-report.csv');
            return res.send(csv);
        }

        // Generate PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=jobs-report.pdf');
        doc.pipe(res);

        // Title and Header
        doc.fontSize(24)
           .fillColor('#2563eb')
           .text('Jobs Report', { align: 'center' })
           .moveDown();

        // Generation date
            doc.fontSize(12)
           .fillColor('#666666')
           .text(`Generated on: ${formatDate(new Date())}`, { align: 'right' })
               .moveDown();

        // Summary Statistics
        doc.fontSize(14)
           .fillColor('#000000')
           .text('Summary Statistics')
           .fontSize(12)
           .moveDown(0.5);

        const totalJobs = jobs.length;
        const activeJobs = jobs.filter(j => j.status === 'approved').length;
        const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'paid').length;
        const totalEarnings = enhancedJobs.reduce((sum, job) => {
            const earnings = parseFloat(job['Total Earnings'].replace('$', '')) || 0;
            return sum + earnings;
        }, 0);

        doc.text(`Total Jobs: ${totalJobs}`)
           .text(`Active Jobs: ${activeJobs}`)
           .text(`Completed Jobs: ${completedJobs}`)
           .text(`Total Platform Earnings: $${totalEarnings}`)
           .moveDown();

        // Create table
        const tableTop = 200;
        const colWidths = {
            id: 40,
            title: 120,
            category: 70,    // Reduced slightly
            district: 70,    // Reduced slightly
            poster: 80,
            status: 60,      // Reduced slightly
            stats: 180,      // Increased for better spacing
            financial: 120
        };

        const rowHeight = 50;  // Adjusted to ensure text doesn't feel cramped

        // Table headers
        let currentX = 30;
        doc.font('Helvetica-Bold');
        
        const headers = {
            'ID': colWidths.id,
            'Title': colWidths.title,
            'Category': colWidths.category,
            'District': colWidths.district,
            'Posted By': colWidths.poster,
            'Status': colWidths.status,
            'Statistics': colWidths.stats,
            'Financial': colWidths.financial
        };

        Object.entries(headers).forEach(([header, width]) => {
            doc.text(header, currentX, tableTop, { width });
            currentX += width;
        });

        // Table rows
        let yPosition = tableTop + 20;
        doc.font('Helvetica');

        enhancedJobs.forEach((job, index) => {
            // Add new page if needed
            if (yPosition > 500) {
                doc.addPage();
                yPosition = 50;
                
                // Repeat headers on new page
                currentX = 30;
                doc.font('Helvetica-Bold');
                Object.entries(headers).forEach(([header, width]) => {
                    doc.text(header, currentX, yPosition, { width });
                    currentX += width;
                });
                yPosition += 20;
                doc.font('Helvetica');
            }

            // Add zebra striping
            if (index % 2 === 1) {
                doc.fillColor('#f8f8f8')
                   .rect(30, yPosition - 5, 800, 40)
                   .fill()
                   .fillColor('#000000');
            }

            currentX = 30;
            
            // Basic info
            doc.text(String(job.ID), currentX, yPosition, { width: colWidths.id });
            currentX += colWidths.id;
            
            doc.text(job.Title, currentX, yPosition, { width: colWidths.title });
            currentX += colWidths.title;
            
            doc.text(job.Category, currentX, yPosition, { width: colWidths.category });
            currentX += colWidths.category;
            
            doc.text(job.District, currentX, yPosition, { width: colWidths.district });
            currentX += colWidths.district;
            
            doc.text(job['Posted By'], currentX, yPosition, { width: colWidths.poster });
            currentX += colWidths.poster;
            
            doc.text(job.Status, currentX, yPosition, { width: colWidths.status });
            currentX += colWidths.status;

            // Statistics
            doc.text(
                `Applications: ${job.Applications}\n` +
                `Completed: ${job.Completed}\n` +
                `Success Rate: ${job['Success Rate']}`,
                currentX, yPosition,
                { 
                    width: colWidths.stats,
                    lineGap: 3  // Add more space between lines
                }
            );
            currentX += colWidths.stats;

            // Financial
            doc.text(
                `Listed: ${job['Payment Amount']}\n` +
                `Earned: ${job['Total Earnings']}`,
                currentX, yPosition,
                { width: colWidths.financial }
            );

            yPosition += rowHeight;
        });

            doc.end();
    } catch (error) {
        console.error('Error generating jobs report:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating report' 
        });
    }
};

export const generateBookingsReport = async (req, res) => {
    try {
        const { format = 'pdf' } = req.query;
        
        // Fetch all bookings with relevant data
        const bookings = await Booking.find().lean();
        
        // Get additional statistics for each booking
        const enhancedBookings = await Promise.all(bookings.map(async (booking) => {
            // Get related job and payment info
            const job = await Job.findById(booking.jobId);
            const payment = await Payment.aggregate([
                {
                    $match: {
                        bookingId: booking._id,
                        status: { $in: ['confirmed', 'completed'] }
                    }
                }
            ]);

            const seeker = await User.findById(booking.seekerId);
            const poster = await User.findById(booking.posterId);

            return {
                'ID': booking._id,
                'Job Title': booking.jobTitle,
                'Job Category': job?.category || 'N/A',
                'Job District': job?.district || 'N/A',
                'Seeker': seeker?.name || 'N/A',
                'Poster': poster?.name || 'N/A',
                'Status': booking.status,
                'Amount': `$${booking.payment?.amount || 0}`,
                'Payment Status': booking.payment?.status || 'N/A',
                'Applied Date': formatDate(booking.dates?.applied),
                'Completed Date': booking.dates?.completed ? formatDate(booking.dates.completed) : 'N/A',
                'Duration': booking.dates?.completed ? 
                    `${Math.ceil((new Date(booking.dates.completed) - new Date(booking.dates.applied)) / (1000 * 60 * 60 * 24))} days` : 
                    'N/A'
            };
        }));

        if (format === 'csv') {
            const fields = [
                'ID', 'Job Title', 'Job Category', 'Job District', 'Seeker', 
                'Poster', 'Status', 'Amount', 'Payment Status', 'Applied Date',
                'Completed Date', 'Duration'
            ];
            
            const parser = new Parser({ fields });
            const csv = parser.parse(enhancedBookings);
            
                res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.csv');
            return res.send(csv);
        }

        // Generate PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.pdf');
        doc.pipe(res);

        // Title and Header
        doc.fontSize(24)
           .fillColor('#2563eb')
           .text('Bookings Report', { align: 'center' })
           .moveDown();

        // Generation date
        doc.fontSize(12)
           .fillColor('#666666')
           .text(`Generated on: ${formatDate(new Date())}`, { align: 'right' })
           .moveDown();

        // Summary Statistics
        doc.fontSize(14)
           .fillColor('#000000')
           .text('Summary Statistics')
           .fontSize(12)
           .moveDown(0.5);

        const totalBookings = bookings.length;
        const activeBookings = bookings.filter(b => ['accepted', 'in_progress'].includes(b.status)).length;
        const completedBookings = bookings.filter(b => ['completed', 'paid'].includes(b.status)).length;
        const totalAmount = bookings.reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0);

        doc.text(`Total Bookings: ${totalBookings}`)
           .text(`Active Bookings: ${activeBookings}`)
           .text(`Completed Bookings: ${completedBookings}`)
           .text(`Total Transaction Amount: $${totalAmount}`)
           .moveDown();

        // Create table
        const tableTop = 200;
        const colWidths = {
            id: 45,
            title: 110,
            category: 70,
            district: 70,
            seeker: 90,      // Increased for names
            poster: 90,      // Increased for names
            status: 80,      // Increased for status text
            payment: 130,    // Increased for payment info
            dates: 150       // Increased for timeline info
        };

        const rowHeight = 55;  // Increased from 40

        // Table headers
        let currentX = 30;
        doc.font('Helvetica-Bold');
        
        const headers = {
            'ID': colWidths.id,
            'Job Title': colWidths.title,
            'Category': colWidths.category,
            'District': colWidths.district,
            'Seeker': colWidths.seeker,
            'Poster': colWidths.poster,
            'Status': colWidths.status,
            'Payment': colWidths.payment,
            'Timeline': colWidths.dates
        };

        Object.entries(headers).forEach(([header, width]) => {
            doc.text(header, currentX, tableTop, { width });
            currentX += width;
        });

        // Table rows with zebra striping
        let yPosition = tableTop + 20;
        doc.font('Helvetica');

        enhancedBookings.forEach((booking, index) => {
            // Add new page if needed
            if (yPosition > 500) {
                doc.addPage();
                yPosition = 50;
                
                // Repeat headers on new page
                currentX = 30;
                doc.font('Helvetica-Bold');
                Object.entries(headers).forEach(([header, width]) => {
                    doc.text(header, currentX, yPosition, { width });
                    currentX += width;
                });
                yPosition += 20;
                doc.font('Helvetica');
            }

            // Zebra striping
            if (index % 2 === 1) {
                doc.fillColor('#f8f8f8')
                   .rect(30, yPosition - 5, 800, 40)
                   .fill()
                   .fillColor('#000000');
            }

            currentX = 30;
            
            // Basic info
            doc.text(String(booking.ID), currentX, yPosition, { width: colWidths.id });
            currentX += colWidths.id;
            
            doc.text(booking['Job Title'], currentX, yPosition, { width: colWidths.title });
            currentX += colWidths.title;
            
            doc.text(booking['Job Category'], currentX, yPosition, { width: colWidths.category });
            currentX += colWidths.category;
            
            doc.text(booking['Job District'], currentX, yPosition, { width: colWidths.district });
            currentX += colWidths.district;
            
            doc.text(booking.Seeker, currentX, yPosition, { width: colWidths.seeker });
            currentX += colWidths.seeker;
            
            doc.text(booking.Poster, currentX, yPosition, { width: colWidths.poster });
            currentX += colWidths.poster;
            
            // Status with color coding
            const statusColor = {
                'applied': '#6366f1',      // Indigo
                'accepted': '#059669',     // Green
                'in_progress': '#0891b2',  // Cyan
                'completed': '#059669',    // Green
                'paid': '#059669',         // Green
                'declined': '#dc2626',     // Red
                'cancelled': '#dc2626'     // Red
            }[booking.Status] || '#000000';

            doc.fillColor(statusColor)
               .text(booking.Status, currentX, yPosition, { width: colWidths.status })
               .fillColor('#000000');
            currentX += colWidths.status;

            // Payment info
            doc.text(
                `Amount: ${booking.Amount}\n` +
                `Status: ${booking['Payment Status']}`,
                currentX, yPosition,
                { 
                    width: colWidths.payment, 
                    lineGap: 4  // Increased line gap
                }
            );
            currentX += colWidths.payment;

            // Timeline
            doc.text(
                `Applied: ${booking['Applied Date']}\n` +
                `Completed: ${booking['Completed Date']}\n` +
                `Duration: ${booking.Duration}`,
                currentX, yPosition,
                { 
                    width: colWidths.dates, 
                    lineGap: 4,  // Increased line gap
                    align: 'left'
                }
            );

            // Adjust vertical position for next row
            yPosition += rowHeight;

            // Add padding between rows
            doc.lineWidth(0.5)
               .strokeColor('#e5e7eb')
               .moveTo(30, yPosition - 5)
               .lineTo(830, yPosition - 5)
               .stroke();
        });

        doc.end();
    } catch (error) {
        console.error('Error generating bookings report:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Error generating report' 
            });
        }
};

export const generatePaymentsReport = async (req, res) => {
    try {
        const { format = 'pdf' } = req.query;
        
        // Fetch all payments with relevant data
        const payments = await Payment.find().lean();
        
        // Get additional statistics for each payment
        const enhancedPayments = await Promise.all(payments.map(async (payment) => {
            const booking = await Booking.findById(payment.bookingId);
            const seeker = booking ? await User.findById(booking.seekerId) : null;
            const poster = booking ? await User.findById(booking.posterId) : null;
            const job = booking ? await Job.findById(booking.jobId) : null;

            return {
                'ID': payment._id,
                'Booking ID': payment.bookingId,
                'Job Title': booking?.jobTitle || 'N/A',
                'Category': job?.category || 'N/A',
                'Amount': `$${payment.amount}`,
                'Seeker': seeker?.name || 'N/A',
                'Poster': poster?.name || 'N/A',
                'Payment Type': payment.paymentType,
                'Payment Method': payment.paymentMethod,
                'Status': payment.status,
                'Date': formatDate(payment.paymentDate),
                'Completed Date': payment.completedAt ? formatDate(payment.completedAt) : 'N/A'
            };
        }));

        if (format === 'csv') {
            const fields = [
                'ID', 'Booking ID', 'Job Title', 'Category', 'Amount',
                'Seeker', 'Poster', 'Payment Type', 'Payment Method',
                'Status', 'Date', 'Completed Date'
            ];
            
            const parser = new Parser({ fields });
            const csv = parser.parse(enhancedPayments);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=payments-report.csv');
            return res.send(csv);
        }

        // Generate PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=payments-report.pdf');
        doc.pipe(res);

        // Title and Header
        doc.fontSize(24)
           .fillColor('#2563eb')
           .text('Payments Report', { align: 'center' })
           .moveDown();

        // Generation date
        doc.fontSize(12)
           .fillColor('#666666')
           .text(`Generated on: ${formatDate(new Date())}`, { align: 'right' })
           .moveDown();

        // Summary Statistics
        doc.fontSize(14)
           .fillColor('#000000')
           .text('Summary Statistics')
           .fontSize(12)
           .moveDown(0.5);

        const totalPayments = payments.length;
        const completedPayments = payments.filter(p => p.status === 'completed').length;
        const pendingPayments = payments.filter(p => p.status === 'pending').length;
        const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        doc.text(`Total Payments: ${totalPayments}`)
           .text(`Completed Payments: ${completedPayments}`)
           .text(`Pending Payments: ${pendingPayments}`)
           .text(`Total Transaction Amount: $${totalAmount.toFixed(2)}`)
           .moveDown();

        // Create table
        const tableTop = 200;
        const colWidths = {
            id: 45,
            bookingId: 60,
            jobTitle: 100,
            amount: 70,
            seeker: 90,
            poster: 90,
            status: 70,
            type: 80,
            date: 120
        };

        const rowHeight = 55;  // Increased for better spacing

        // Table headers
        let currentX = 30;
        doc.font('Helvetica-Bold');
        
        const headers = {
            'ID': colWidths.id,
            'Booking': colWidths.bookingId,
            'Job Title': colWidths.jobTitle,
            'Amount': colWidths.amount,
            'Seeker': colWidths.seeker,
            'Poster': colWidths.poster,
            'Status': colWidths.status,
            'Type': colWidths.type,
            'Timeline': colWidths.date
        };

        Object.entries(headers).forEach(([header, width]) => {
            doc.text(header, currentX, tableTop, { width });
            currentX += width;
        });

        // Table rows
        let yPosition = tableTop + 20;
        doc.font('Helvetica');

        enhancedPayments.forEach((payment, index) => {
            // Add new page if needed
            if (yPosition > 500) {
                doc.addPage();
                yPosition = 50;
                
                // Repeat headers on new page
                currentX = 30;
                doc.font('Helvetica-Bold');
                Object.entries(headers).forEach(([header, width]) => {
                    doc.text(header, currentX, yPosition, { width });
                    currentX += width;
                });
                yPosition += 20;
                doc.font('Helvetica');
            }

            // Zebra striping
            if (index % 2 === 1) {
                doc.fillColor('#f8f8f8')
                   .rect(30, yPosition - 5, 800, rowHeight)
                   .fill()
                   .fillColor('#000000');
            }

            currentX = 30;

            // Row data with proper spacing
            doc.text(String(payment.ID), currentX, yPosition, { width: colWidths.id });
            currentX += colWidths.id;
            
            doc.text(String(payment['Booking ID']), currentX, yPosition, { width: colWidths.bookingId });
            currentX += colWidths.bookingId;
            
            doc.text(payment['Job Title'], currentX, yPosition, { width: colWidths.jobTitle });
            currentX += colWidths.jobTitle;
            
            doc.text(payment.Amount, currentX, yPosition, { width: colWidths.amount });
            currentX += colWidths.amount;
            
            doc.text(payment.Seeker, currentX, yPosition, { width: colWidths.seeker });
            currentX += colWidths.seeker;
            
            doc.text(payment.Poster, currentX, yPosition, { width: colWidths.poster });

            // Status with color coding
            const statusColor = {
                'pending': '#6366f1',      // Indigo
                'awaiting_confirmation': '#0891b2',  // Cyan
                'confirmed': '#059669',    // Green
                'completed': '#059669',     // Green
                'reported': '#dc2626'      // Red
            }[payment.Status] || '#000000';

            doc.fillColor(statusColor)
               .text(payment.Status, currentX, yPosition, { width: colWidths.status })
               .fillColor('#000000');
            currentX += colWidths.status;

            doc.text(payment['Payment Type'], currentX, yPosition, { width: colWidths.type });
            currentX += colWidths.type;

            // Timeline info
            doc.text(
                `Created: ${payment.Date}\n` +
                `Completed: ${payment['Completed Date']}`,
                currentX, yPosition,
                { 
                    width: colWidths.date,
                    lineGap: 4  // Add space between lines
                }
            );

            yPosition += rowHeight;
        });

        // Add table border
        doc.rect(30, tableTop - 5, 800, yPosition - tableTop + 5)
           .stroke();

        doc.end();
    } catch (error) {
        console.error('Error generating payments report:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating report' 
        });
    }
};

export const generateTicketsReport = async (req, res) => {
    try {
        const { format = 'pdf' } = req.query;
        
        // Fetch all tickets with relevant data
        const tickets = await Ticket.find().lean();
        
        // Get additional statistics for each ticket
        const enhancedTickets = await Promise.all(tickets.map(async (ticket) => {
            const user = await User.findById(ticket.userId);

            return {
                'ID': ticket._id,
                'User': user?.name || 'N/A',
                'Email': ticket.email,
                'Subject': ticket.subject,
                'Priority': ticket.priority,
                'Status': ticket.status,
                'Created': formatDate(ticket.createdAt),
                'Last Updated': formatDate(ticket.updatedAt),
                'Response Time': ticket.replies?.length > 0 ? 
                    `${Math.ceil((new Date(ticket.replies[0].createdAt) - new Date(ticket.createdAt)) / (1000 * 60 * 60))} hours` : 
                    'N/A',
                'Total Responses': ticket.replies?.length || 0
            };
        }));

        if (format === 'csv') {
            const fields = [
                'ID', 'User', 'Email', 'Subject', 'Priority', 'Status',
                'Created', 'Last Updated', 'Response Time', 'Total Responses'
            ];
            
            const parser = new Parser({ fields });
            const csv = parser.parse(enhancedTickets);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=tickets-report.csv');
            return res.send(csv);
        }

        // Generate PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=tickets-report.pdf');
        doc.pipe(res);

        // Title and Header
        doc.fontSize(24)
           .fillColor('#2563eb')
           .text('Support Tickets Report', { align: 'center' })
           .moveDown();

        // Generation date
        doc.fontSize(12)
           .fillColor('#666666')
           .text(`Generated on: ${formatDate(new Date())}`, { align: 'right' })
           .moveDown();

        // Summary Statistics
        doc.fontSize(14)
           .fillColor('#000000')
           .text('Summary Statistics')
           .fontSize(12)
           .moveDown(1);  // Add space after title

        doc.text(`Total Tickets: ${tickets.length}`)
           .moveDown(0.5)  // Add space between each line
           .text(`Open Tickets: ${tickets.filter(t => t.status === 'Open').length}`)
           .moveDown(0.5)
           .text(`In Progress: ${tickets.filter(t => t.status === 'In Progress').length}`)
           .moveDown(0.5)
           .text(`Resolved: ${tickets.filter(t => t.status === 'Resolved').length}`)
           .moveDown(0.5)
           .text(`Urgent Tickets: ${tickets.filter(t => t.priority === 'Urgent').length}`)
           .moveDown(3);  // Add extra space before table starts

        // Adjust table starting position
        const tableTop = 270;  // Moved down from 200 to give more space

        const colWidths = {
            id: 45,
            user: 100,
            email: 130,
            subject: 150,    // Increased for longer subjects
            priority: 70,    // Increased for priority text
            status: 80,     // Increased for status text
            dates: 170,     // Increased for timeline info
            responses: 90    // Increased for response info
        };

        const rowHeight = 65;  // Increased to give more vertical space

        // Table headers
        let currentX = 30;
        doc.font('Helvetica-Bold');
        
        const headers = {
            'ID': colWidths.id,
            'User': colWidths.user,
            'Email': colWidths.email,
            'Subject': colWidths.subject,
            'Priority': colWidths.priority,
            'Status': colWidths.status,
            'Timeline': colWidths.dates,
            'Responses': colWidths.responses
        };

        Object.entries(headers).forEach(([header, width]) => {
            doc.text(header, currentX, tableTop, { width });
            currentX += width;
        });

        // Table rows
        let yPosition = tableTop + 20;
        doc.font('Helvetica');

        enhancedTickets.forEach((ticket, index) => {
            // Add new page if needed
            if (yPosition > 500) {
                doc.addPage();
                yPosition = 50;
                
                // Repeat headers on new page
                currentX = 30;
                doc.font('Helvetica-Bold');
                Object.entries(headers).forEach(([header, width]) => {
                    doc.text(header, currentX, yPosition, { width });
                    currentX += width;
                });
                yPosition += 20;
                doc.font('Helvetica');
            }

            // Zebra striping
            if (index % 2 === 1) {
                doc.fillColor('#f8f8f8')
                   .rect(30, yPosition - 5, 800, rowHeight)
                   .fill()
                   .fillColor('#000000');
            }

            currentX = 30;

            // Basic info
            doc.text(String(ticket.ID), currentX, yPosition, { width: colWidths.id });
            currentX += colWidths.id;
            
            doc.text(ticket.User, currentX, yPosition, { width: colWidths.user });
            currentX += colWidths.user;
            
            doc.text(ticket.Email, currentX, yPosition, { width: colWidths.email });
            currentX += colWidths.email;
            
            doc.text(ticket.Subject, currentX, yPosition, { width: colWidths.subject });
            currentX += colWidths.subject;

            // Priority with color coding
            const priorityColor = ticket.Priority === 'Urgent' ? '#dc2626' : '#000000';
            doc.fillColor(priorityColor)
               .text(ticket.Priority, currentX, yPosition, { width: colWidths.priority })
               .fillColor('#000000');
            currentX += colWidths.priority;

            // Status with color coding
            const statusColor = {
                'Open': '#6366f1',      // Indigo
                'In Progress': '#0891b2', // Cyan
                'Resolved': '#059669',   // Green
                'Closed': '#4b5563'      // Gray
            }[ticket.Status] || '#000000';

            doc.fillColor(statusColor)
               .text(ticket.Status, currentX, yPosition, { width: colWidths.status })
               .fillColor('#000000');
            currentX += colWidths.status;

            // Timeline info
            doc.text(
                `Created: ${ticket.Created}\n` +
                `Updated: ${ticket['Last Updated']}\n` +
                `Response: ${ticket['Response Time']}`,
                currentX, yPosition,
                { 
                    width: colWidths.dates,
                    lineGap: 5,  // Increased line gap
                    align: 'left'
                }
            );
            currentX += colWidths.dates;

            // Response count
            doc.text(
                `Total: ${ticket['Total Responses']}`,
                currentX, yPosition + 10,  // Added vertical offset to center single line
                { 
                    width: colWidths.responses,
                    align: 'left'
                }
            );

            yPosition += rowHeight;
        });

        // Add table border
        doc.rect(30, tableTop - 5, 800, yPosition - tableTop + 5)
           .stroke();

        doc.end();
    } catch (error) {
        console.error('Error generating tickets report:', error);
        res.status(500).json({ 
                success: false,
            message: error.message || 'Error generating report' 
        });
    }
};


export const generateReviewsReport = async (req, res) => {
    try {
        const { format = 'pdf' } = req.query;
        
        // Fetch all reviews with relevant data
        const reviews = await Review.find().lean();
        
        // Get additional statistics for each review
        const enhancedReviews = await Promise.all(reviews.map(async (review) => {
            const booking = await Booking.findById(review.bookingId);
            const reviewer = await User.findById(review.reviewerId);
            const reviewee = await User.findById(review.revieweeId);

            return {
                'ID': review._id,
                'Booking ID': review.bookingId,
                'Job Title': booking?.jobTitle || 'N/A',
                'Reviewer': reviewer?.name || 'N/A',
                'Reviewee': reviewee?.name || 'N/A',
                'Rating': review.rating,
                'Comment': review.comment || 'N/A',
                'Type': review.reviewType === 'customer_to_seeker' ? 'Customer → Seeker' : 'Seeker → Customer',
                'Date': formatDate(review.createdAt)
            };
        }));

        if (format === 'csv') {
            const fields = [
                'ID', 'Booking ID', 'Job Title', 'Reviewer', 'Reviewee',
                'Rating', 'Comment', 'Type', 'Date'
            ];
            
            const parser = new Parser({ fields });
            const csv = parser.parse(enhancedReviews);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=reviews-report.csv');
            return res.send(csv);
        }

        // Generate PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reviews-report.pdf');
        doc.pipe(res);

        // Title and Header
        doc.fontSize(24)
           .fillColor('#2563eb')
           .text('Reviews Report', { align: 'center' })
           .moveDown();

        // Generation date
        doc.fontSize(12)
           .fillColor('#666666')
           .text(`Generated on: ${formatDate(new Date())}`, { align: 'right' })
           .moveDown();

        // Summary Statistics
        doc.fontSize(14)
           .fillColor('#000000')
           .text('Summary Statistics')
           .fontSize(12)
           .moveDown(1);

        const totalReviews = reviews.length;
        const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) || 0;
        const customerToSeekerReviews = reviews.filter(r => r.reviewType === 'customer_to_seeker').length;
        const seekerToCustomerReviews = reviews.filter(r => r.reviewType === 'seeker_to_customer').length;

        doc.text(`Total Reviews: ${totalReviews}`)
           .moveDown(0.5)
           .text(`Average Rating: ${avgRating.toFixed(1)} ⭐`)
           .moveDown(0.5)
           .text(`Customer to Seeker Reviews: ${customerToSeekerReviews}`)
           .moveDown(0.5)
           .text(`Seeker to Customer Reviews: ${seekerToCustomerReviews}`)
           .moveDown(3);

        // Create table
        const tableTop = 270;
        const colWidths = {
            id: 45,
            bookingId: 60,
            jobTitle: 120,
            reviewer: 90,
            reviewee: 90,
            rating: 60,
            comment: 150,
            type: 80,
            date: 80
        };

        const rowHeight = 65;

        // Table headers
        let currentX = 30;
        doc.font('Helvetica-Bold');
        
        const headers = {
            'ID': colWidths.id,
            'Booking': colWidths.bookingId,
            'Job Title': colWidths.jobTitle,
            'Reviewer': colWidths.reviewer,
            'Reviewee': colWidths.reviewee,
            'Rating': colWidths.rating,
            'Comment': colWidths.comment,
            'Type': colWidths.type,
            'Date': colWidths.date
        };

        Object.entries(headers).forEach(([header, width]) => {
            doc.text(header, currentX, tableTop, { width });
            currentX += width;
        });

        // Table rows
        let yPosition = tableTop + 20;
        doc.font('Helvetica');

        enhancedReviews.forEach((review, index) => {
            // Add new page if needed
            if (yPosition > 500) {
                doc.addPage();
                yPosition = 50;
                
                // Repeat headers on new page
                currentX = 30;
                doc.font('Helvetica-Bold');
                Object.entries(headers).forEach(([header, width]) => {
                    doc.text(header, currentX, yPosition, { width });
                    currentX += width;
                });
                yPosition += 20;
                doc.font('Helvetica');
            }

            // Zebra striping
            if (index % 2 === 1) {
                doc.fillColor('#f8f8f8')
                   .rect(30, yPosition - 5, 800, rowHeight)
                   .fill()
                   .fillColor('#000000');
            }

            currentX = 30;

            // Basic info
            doc.text(String(review.ID), currentX, yPosition, { width: colWidths.id });
            currentX += colWidths.id;
            
            doc.text(String(review['Booking ID']), currentX, yPosition, { width: colWidths.bookingId });
            currentX += colWidths.bookingId;
            
            doc.text(review['Job Title'], currentX, yPosition, { width: colWidths.jobTitle });
            currentX += colWidths.jobTitle;
            
            doc.text(review.Reviewer, currentX, yPosition, { width: colWidths.reviewer });
            currentX += colWidths.reviewer;
            
            doc.text(review.Reviewee, currentX, yPosition, { width: colWidths.reviewee });
            currentX += colWidths.reviewee;

            // Rating with stars
            doc.text(`${review.Rating} ⭐`, currentX, yPosition, { width: colWidths.rating });
            currentX += colWidths.rating;

            // Comment with word wrap
            doc.text(review.Comment, currentX, yPosition, { 
                width: colWidths.comment,
                lineGap: 4
            });
            currentX += colWidths.comment;

            // Review type
            doc.text(review.Type, currentX, yPosition, { width: colWidths.type });
            currentX += colWidths.type;

            // Date
            doc.text(review.Date, currentX, yPosition, { width: colWidths.date });

            yPosition += rowHeight;
        });

        // Add table border
        doc.rect(30, tableTop - 5, 800, yPosition - tableTop + 5)
           .stroke();

        doc.end();
    } catch (error) {
        console.error('Error generating reviews report:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating report' 
        });
    }
};

export const generateContactsReport = async (req, res) => {
    try {
        const { format = 'pdf' } = req.query;
        
        // Fetch all contacts with relevant data
        const contacts = await Contact.find().lean();
        
        // Enhance contact data
        const enhancedContacts = contacts.map(contact => ({
            'ID': contact._id,
            'Name': contact.name,
            'Email': contact.email,
            'Subject': contact.subject,
            'Status': contact.status,
            'Message': contact.message,
            'Replies': contact.replies?.length || 0,
            'Created': formatDate(contact.createdAt),
            'Last Updated': formatDate(contact.updatedAt)
        }));

        if (format === 'csv') {
            const fields = [
                'ID', 'Name', 'Email', 'Subject', 'Status',
                'Message', 'Replies', 'Created', 'Last Updated'
            ];
            
            const parser = new Parser({ fields });
            const csv = parser.parse(enhancedContacts);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=contacts-report.csv');
            return res.send(csv);
        }

        // Generate PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=contacts-report.pdf');
        doc.pipe(res);

        // Title and Header
        doc.fontSize(24)
           .fillColor('#2563eb')
           .text('Contact Inquiries Report', { align: 'center' })
           .moveDown();

        // Generation date
        doc.fontSize(12)
           .fillColor('#666666')
           .text(`Generated on: ${formatDate(new Date())}`, { align: 'right' })
           .moveDown();

        // Summary Statistics
        doc.fontSize(14)
           .fillColor('#000000')
           .text('Summary Statistics')
           .fontSize(12)
           .moveDown(1);

        // Calculate statistics
        const totalContacts = contacts.length;
        const newContacts = contacts.filter(c => c.status === 'New').length;
        const inProgressContacts = contacts.filter(c => c.status === 'In Progress').length;
        const resolvedContacts = contacts.filter(c => c.status === 'Resolved').length;

        doc.text(`Total Inquiries: ${totalContacts}`)
           .moveDown(0.5)
           .text(`New Inquiries: ${newContacts}`)
           .moveDown(0.5)
           .text(`In Progress: ${inProgressContacts}`)
           .moveDown(0.5)
           .text(`Resolved: ${resolvedContacts}`)
           .moveDown(3);

        // Create table
        const tableTop = 270;
        const colWidths = {
            id: 45,
            name: 100,
            email: 130,
            subject: 150,
            status: 80,
            replies: 70,
            dates: 150
        };

        const rowHeight = 65;

        // Table headers
        let currentX = 30;
        doc.font('Helvetica-Bold');
        
        const headers = {
            'ID': colWidths.id,
            'Name': colWidths.name,
            'Email': colWidths.email,
            'Subject': colWidths.subject,
            'Status': colWidths.status,
            'Replies': colWidths.replies,
            'Timeline': colWidths.dates
        };

        Object.entries(headers).forEach(([header, width]) => {
            doc.text(header, currentX, tableTop, { width });
            currentX += width;
        });

        // Table rows
        let yPosition = tableTop + 20;
        doc.font('Helvetica');

        enhancedContacts.forEach((contact, index) => {
            // Add new page if needed
            if (yPosition > 500) {
                doc.addPage();
                yPosition = 50;
                
                // Repeat headers on new page
                currentX = 30;
                doc.font('Helvetica-Bold');
                Object.entries(headers).forEach(([header, width]) => {
                    doc.text(header, currentX, yPosition, { width });
                    currentX += width;
                });
                yPosition += 20;
                doc.font('Helvetica');
            }

            // Zebra striping
            if (index % 2 === 1) {
                doc.fillColor('#f8f8f8')
                   .rect(30, yPosition - 5, 800, rowHeight)
                   .fill()
                   .fillColor('#000000');
            }

            currentX = 30;

            // Basic info
            doc.text(String(contact.ID), currentX, yPosition, { width: colWidths.id });
            currentX += colWidths.id;
            
            doc.text(contact.Name, currentX, yPosition, { width: colWidths.name });
            currentX += colWidths.name;
            
            doc.text(contact.Email, currentX, yPosition, { width: colWidths.email });
            currentX += colWidths.email;
            
            doc.text(contact.Subject, currentX, yPosition, { width: colWidths.subject });
            currentX += colWidths.subject;

            // Status with color coding
            const statusColor = {
                'New': '#6366f1',      // Indigo
                'In Progress': '#0891b2', // Cyan
                'Resolved': '#059669'   // Green
            }[contact.Status] || '#000000';

            doc.fillColor(statusColor)
               .text(contact.Status, currentX, yPosition, { width: colWidths.status })
               .fillColor('#000000');
            currentX += colWidths.status;

            // Replies count
            doc.text(`Total: ${contact.Replies}`, currentX, yPosition, { width: colWidths.replies });
            currentX += colWidths.replies;

            // Timeline info
            doc.text(
                `Created: ${contact.Created}\n` +
                `Updated: ${contact['Last Updated']}`,
                currentX, yPosition,
                { 
                    width: colWidths.dates,
                    lineGap: 5
                }
            );

            yPosition += rowHeight;
        });

        // Add table border
        doc.rect(30, tableTop - 5, 800, yPosition - tableTop + 5)
           .stroke();

        doc.end();
    } catch (error) {
        console.error('Error generating contacts report:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error generating report' 
        });
    }
};