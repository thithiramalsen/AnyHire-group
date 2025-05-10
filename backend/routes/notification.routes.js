import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} from '../controllers/notification.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Get all notifications
router.get('/', getNotifications);

// Mark a notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

// Delete all notifications
router.delete('/', deleteAllNotifications);

export default router; 