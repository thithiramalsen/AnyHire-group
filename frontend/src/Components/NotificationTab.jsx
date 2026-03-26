import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { Bell, Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationTab = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, [page]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`/notifications?page=${page}`);
            setNotifications(response.data.notifications);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to fetch notifications');
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(`/notifications/${notificationId}/read`);
            setNotifications(notifications.map(notif => 
                notif._id === notificationId ? { ...notif, isRead: true } : notif
            ));
            toast.success('Notification marked as read');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch('/notifications/read-all');
            setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    };

    const clearAllNotifications = async () => {
        try {
            if (!window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
                return;
            }

            await axios.delete('/notifications/clear-all');
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch (error) {
            console.error('Error clearing notifications:', error);
            toast.error('Failed to clear notifications');
        }
    };

    const getNotificationContent = (notification) => {
        return {
            message: notification.message,
            icon: <Bell className="w-5 h-5 text-emerald-400" />
        };
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Notifications</h2>
                <div className="flex gap-4">
                    <button
                        onClick={markAllAsRead}
                        className="text-sm text-emerald-500 hover:text-emerald-400"
                    >
                        Mark all as read
                    </button>
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAllNotifications}
                            className="text-sm text-red-500 hover:text-red-400 flex items-center gap-1"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    No notifications
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => {
                        const content = getNotificationContent(notification);
                        return (
                            <div
                                key={notification._id}
                                className={`p-4 rounded-lg transition-colors ${
                                    notification.isRead ? 'bg-gray-800' : 'bg-gray-700/80 border border-emerald-500/20'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {content.icon}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-medium text-white">
                                            {notification.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {content.message}
                                        </p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-gray-500">
                                                {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`p-2 rounded ${
                            page === 1 
                                ? 'text-gray-500 cursor-not-allowed' 
                                : 'text-emerald-500 hover:text-emerald-400'
                        }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-gray-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={`p-2 rounded ${
                            page === totalPages 
                                ? 'text-gray-500 cursor-not-allowed' 
                                : 'text-emerald-500 hover:text-emerald-400'
                        }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationTab;