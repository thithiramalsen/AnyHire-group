import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';

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

        // Generate PDF with updated table structure
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=users-report.pdf');
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

        doc.end();
    } catch (error) {
        console.error('Error generating users report:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating report' 
        });
    }
};

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
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=user-report-${userId}.pdf`);
        doc.pipe(res);

        // Title
        doc.fontSize(20)
           .text('User Report', { align: 'center' })
           .moveDown();

        // Generation date
        doc.fontSize(12)
           .text(`Generated on: ${formatDate(new Date())}`, { align: 'right' })
           .moveDown();

        // User sections
        Object.entries(userData).forEach(([section, data]) => {
            doc.fontSize(16)
               .text(section)
               .moveDown(0.5);

            doc.fontSize(12);
            Object.entries(data).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`);
            });
            doc.moveDown();
        });

        // Recent activity (last 5 bookings)
        const recentBookings = await Booking.find({
            $or: [{ seekerId: userId }, { posterId: userId }]
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('jobId', 'title')
        .lean();

        if (recentBookings.length > 0) {
            doc.fontSize(16)
               .text('Recent Activity')
               .moveDown(0.5);

            doc.fontSize(12);
            recentBookings.forEach(booking => {
                doc.text(`${formatDate(booking.createdAt)} - ${booking.jobId?.title || 'N/A'} (${booking.status})`);
            });
        }

        doc.end();
    } catch (error) {
        console.error('Error generating user report:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating report' 
        });
    }
};