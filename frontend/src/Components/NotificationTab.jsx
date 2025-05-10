import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { Bell, Check, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationTab = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Bell className="w-6 h-6" />
                    Notifications
                </h2>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <p className="text-center text-gray-500">No notifications yet</p>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`p-4 rounded-lg ${
                                notification.isRead ? 'bg-gray-800' : 'bg-gray-700'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                                    <p className="text-gray-300 mt-1">{notification.message}</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <button
                                        onClick={() => markAsRead(notification._id)}
                                        className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                                        title="Mark as read"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            {notification.link && (
                                <a
                                    href={notification.link}
                                    className="text-emerald-500 hover:text-emerald-400 mt-2 inline-block"
                                >
                                    View details →
                                </a>
                            )}
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationTab; 