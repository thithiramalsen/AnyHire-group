import ReportGeneratorService from '../services/reportGenerator.service.js';

export const generateReport = async (req, res) => {
    try {
        const { reportType, timeRange = '30d', format = 'json' } = req.query;
        const report = await ReportGeneratorService.generateReport(reportType, timeRange, format);

        switch (format) {
            case 'csv':
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report-${timeRange}.csv`);
                return res.send(report);
            case 'pdf':
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report-${timeRange}.pdf`);
                return res.send(report);
            case 'json':
            default:
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report-${timeRange}.json`);
                return res.json(report);
        }
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error generating report' 
        });
    }
};

// Generate report for individual user
export const generateUserReport = async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeRange = '30d', format = 'json' } = req.query;
        
        // Check if the requesting user has permission to access this user's data
        const isAdmin = req.user.role === 'admin';
        const isSameUser = req.user._id.toString() === userId;
        
        if (!isAdmin && !isSameUser) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access this user\'s report'
            });
        }

        const report = {
            generatedAt: new Date(),
            timeRange,
            userId,
            reports: {}
        };

        // Get user's jobs
        const jobsReport = await ReportGeneratorService.generateJobsReport(timeRange, 'json', userId);
        report.reports.jobs = jobsReport;

        // Get user's bookings
        const bookingsReport = await ReportGeneratorService.generateBookingsReport(timeRange, 'json', userId);
        report.reports.bookings = bookingsReport;

        // Get user's payments
        const paymentsReport = await ReportGeneratorService.generatePaymentsReport(timeRange, 'json', userId);
        report.reports.payments = paymentsReport;

        // Get user's ratings
        const ratingsReport = await ReportGeneratorService.generateRatingsReport(timeRange, 'json', userId);
        report.reports.ratings = ratingsReport;

        // Get user's support tickets
        const supportReport = await ReportGeneratorService.generateSupportReport(timeRange, 'json', userId);
        report.reports.support = supportReport;

        if (format === 'csv') {
            const csvData = ReportGeneratorService.convertToCSV([report]);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=user-${userId}-report-${timeRange}.csv`);
            return res.send(csvData);
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generating user report:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error generating user report'
        });
    }
};