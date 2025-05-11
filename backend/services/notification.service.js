import Notification from '../models/notification.model.js';

class NotificationService {
    static async createNotification(userId, type, title, message, options = {}) {
        try {
            const { links = {}, references = {} } = options;
            
            const notification = new Notification({
                userId,
                type,
                title,
                message,
                links, // Keep for backward compatibility
                references: {
                    bookingId: references.bookingId,
                    jobId: references.jobId,
                    reviewId: references.reviewId,
                    ticketId: references.ticketId,
                    targetUserId: references.targetUserId
                }
            });

            await notification.save();
            return notification;
        } catch (error) {
            console.error('Service - createNotification error:', error);
            throw error;
        }
    }

    static async getUserNotifications(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            
            const notifications = await Notification
                .find({ userId })
                .populate('references.bookingId')
                .populate('references.jobId')
                .populate('references.reviewId')
                .populate('references.ticketId')
                .populate('references.targetUserId', 'name image')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Notification.countDocuments({ userId });

            // Transform notifications to include both old and new formats
            const transformedNotifications = notifications.map(notification => ({
                ...notification.toObject(),
                links: {
                    ...notification.links, // Keep existing links
                    // Add new reference-based links
                    booking: notification.references?.bookingId ? `/booking/${notification.references.bookingId._id}` : null,
                    job: notification.references?.jobId ? `/jobs/${notification.references.jobId._id}` : null,
                    profile: notification.references?.targetUserId ? `/users/${notification.references.targetUserId._id}` : null
                }
            }));

            return {
                notifications: transformedNotifications,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Service - getUserNotifications error:', error);
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

    static async clearAllNotifications(userId) {
        try {
            await Notification.deleteMany({ userId });
        } catch (error) {
            console.error('Service - clearAllNotifications error:', error);
            throw error;
        }
    }
}

export default NotificationService;