import NotificationService from '../services/notification.service.js';

class NotificationController {
    static async getNotifications(req, res) {
        try {
            const userId = req.user._id;
            const { page = 1, limit = 10 } = req.query;
            
            const result = await NotificationService.getUserNotifications(
                userId,
                parseInt(page),
                parseInt(limit)
            );
            
            res.json(result);
        } catch (error) {
            console.error('Controller - getNotifications error:', error);
            res.status(500).json({ message: 'Error fetching notifications' });
        }
    }

    static async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            const userId = req.user._id;
            
            const notification = await NotificationService.markAsRead(notificationId, userId);
            
            if (!notification) {
                return res.status(404).json({ message: 'Notification not found' });
            }
            
            res.json(notification);
        } catch (error) {
            console.error('Controller - markAsRead error:', error);
            res.status(500).json({ message: 'Error marking notification as read' });
        }
    }

    static async markAllAsRead(req, res) {
        try {
            const userId = req.user._id;
            await NotificationService.markAllAsRead(userId);
            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            console.error('Controller - markAllAsRead error:', error);
            res.status(500).json({ message: 'Error marking all notifications as read' });
        }
    }

    static async getUnreadCount(req, res) {
        try {
            const userId = req.user._id;
            const count = await NotificationService.getUnreadCount(userId);
            res.json({ count });
        } catch (error) {
            console.error('Controller - getUnreadCount error:', error);
            res.status(500).json({ message: 'Error getting unread count' });
        }
    }
}

export default NotificationController;