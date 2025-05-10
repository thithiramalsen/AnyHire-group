import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Bell, Check, X, Brush } from "lucide-react";

const NotificationsTab = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get("/notification");
            if (response.data && response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError("Failed to load notifications. Please try again later.");
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.patch(`/notification/${id}/read`);
            setNotifications(notifications.map(notification =>
                notification._id === id ? { ...notification, isRead: true } : notification
            ));
            toast.success("Notification marked as read");
        } catch (error) {
            console.error("Error marking notification as read:", error);
            toast.error("Failed to mark notification as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.patch("/notification/read-all");
            setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            toast.error("Failed to mark all notifications as read");
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await axios.delete(`/notification/${id}`);
            setNotifications(notifications.filter(notification => notification._id !== id));
            toast.success("Notification deleted");
        } catch (error) {
            console.error("Error deleting notification:", error);
            toast.error("Failed to delete notification");
        }
    };

    const handleDeleteAllNotifications = async () => {
        try {
            await axios.delete("/notification");
            setNotifications([]);
            toast.success("All notifications deleted");
        } catch (error) {
            console.error("Error deleting all notifications:", error);
            toast.error("Failed to delete all notifications");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                    <Bell className="w-6 h-6 text-emerald-500" />
                    <h1 className="text-2xl font-bold text-white">Notifications</h1>
                </div>
                {notifications.length > 0 && (
                    <div className="flex space-x-4">
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                            <Check size={20} />
                            <span>Mark All as Read</span>
                        </button>
                        <button
                            onClick={handleDeleteAllNotifications}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            <Brush size={20} />
                            <span>Clear All</span>
                        </button>
                    </div>
                )}
            </div>

            {error ? (
                <div className="text-center text-gray-400 py-8">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>{error}</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No notifications found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`bg-gray-800 rounded-lg p-4 ${
                                !notification.isRead ? "border-l-4 border-emerald-500" : ""
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="text-white">{notification.message}</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="p-2 text-emerald-500 hover:text-emerald-400 transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteNotification(notification._id)}
                                        className="p-2 text-red-500 hover:text-red-400 transition-colors"
                                        title="Clear notification"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsTab; 