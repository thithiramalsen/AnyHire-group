import Notification from '../models/notification.model.js';

class NotificationService {
    static async createNotification(userId, type, title, message, links = {}) {
        try {
            const notification = new Notification({
                userId,
                type,
                title,
                message,
                links: new Map(Object.entries(links))
            });
            await notification.save();
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    static async getUserNotifications(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const notifications = await Notification
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            
            const total = await Notification.countDocuments({ userId });
            
            return {
                notifications,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    static async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId },
                { isRead: true },
                { new: true }
            );
            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    static async markAllAsRead(userId) {
        try {
            await Notification.updateMany(
                { userId, isRead: false },
                { isRead: true }
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    static async getUnreadCount(userId) {
        try {
            return await Notification.countDocuments({ userId, isRead: false });
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }
}

export default NotificationService;