import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { 
    generateUserReport, 
    generateUsersReport,
    generateJobsReport,
    generateBookingsReport,
    generatePaymentsReport,
    generateTicketsReport,
    generateReviewsReport,
    generateContactsReport
} from "../controllers/reports.controller.js";
import { pdfHandler } from '../middleware/pdfHandler.middleware.js';

const router = express.Router();

// Add pdfHandler middleware to all report routes
router.use(pdfHandler);

// Admin routes
router.get('/admin/users', protectRoute, adminRoute, generateUsersReport);
router.get('/admin/jobs', protectRoute, adminRoute, generateJobsReport);
router.get('/admin/bookings', protectRoute, adminRoute, generateBookingsReport);
router.get('/admin/payments', protectRoute, adminRoute, generatePaymentsReport);
router.get('/admin/tickets', protectRoute, adminRoute, generateTicketsReport);
router.get('/admin/reviews', protectRoute, adminRoute, generateReviewsReport);
router.get('/admin/contacts', protectRoute, adminRoute, generateContactsReport);

// User routes
router.get('/user/:userId', protectRoute, generateUserReport);

export default router;