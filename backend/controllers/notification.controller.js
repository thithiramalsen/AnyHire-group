import Notification from '../models/notification.model.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
    try {
        console.log("Fetching notifications for user:", req.user._id);
        
        if (!req.user || !req.user._id) {
            console.error("No user found in request");
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        
        console.log("Found notifications:", notifications.length);
        
        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error("Error in getNotifications:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch notifications",
            error: error.message 
        });
    }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
    try {
        console.log("Marking notification as read:", req.params.id);
        
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            console.log("Notification not found:", req.params.id);
            return res.status(404).json({ 
                success: false,
                message: 'Notification not found' 
            });
        }
        
        console.log("Notification marked as read:", notification);
        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error("Error in markAsRead:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to mark notification as read",
            error: error.message 
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        console.log("Marking all notifications as read for user:", req.user._id);
        
        const result = await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );
        
        console.log("Marked notifications as read:", result);
        res.json({ 
            success: true,
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error in markAllAsRead:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to mark all notifications as read",
            error: error.message 
        });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        console.log("Deleting notification:", req.params.id);
        
        const notification = await Notification.findByIdAndDelete(req.params.id);
        
        if (!notification) {
            console.log("Notification not found:", req.params.id);
            return res.status(404).json({ 
                success: false,
                message: 'Notification not found' 
            });
        }
        
        console.log("Notification deleted:", notification);
        res.json({ 
            success: true,
            message: 'Notification deleted' 
        });
    } catch (error) {
        console.error("Error in deleteNotification:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to delete notification",
            error: error.message 
        });
    }
};

// Delete all notifications
export const deleteAllNotifications = async (req, res) => {
    try {
        console.log("Deleting all notifications for user:", req.user._id);
        
        const result = await Notification.deleteMany({ userId: req.user._id });
        
        console.log("Deleted notifications:", result);
        res.json({ 
            success: true,
            message: 'All notifications deleted',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error in deleteAllNotifications:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to delete all notifications",
            error: error.message 
        });
    }
}; 