import { Router } from 'express';
import NotificationController from '../controllers/notification.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = Router();

// Get user notifications with pagination
router.get('/', protectRoute, NotificationController.getNotifications);

// Mark a specific notification as read
router.patch('/:notificationId/read', protectRoute, NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', protectRoute, NotificationController.markAllAsRead);

// Get unread notifications count
router.get('/unread-count', protectRoute, NotificationController.getUnreadCount);

// Clear all notifications
router.delete('/clear-all', protectRoute, NotificationController.clearAllNotifications);

export default router;