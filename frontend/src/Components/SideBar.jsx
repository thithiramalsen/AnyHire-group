import { 
    User, Edit, Settings, List, BarChart2, Folder, Calendar, 
    Briefcase, Clock, PlusCircle, MessageSquare, ShoppingCart,
    Home, LogOut, ChevronRight, CreditCard, Star, Users, FileText,
    Bell, Trophy
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { rolePermissions } from "../lib/rolePermissions";
import { useState, useEffect } from "react";
import axios from "../lib/axios";

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useUserStore();
    const [unreadCount, setUnreadCount] = useState(0);

    // Get first and last name from the name field
    const displayName = user?.name || 'User';

    // Get the accessible tabs based on user role
    const accessibleTabs = user?.role ? rolePermissions[user.role]?.tabs || [] : [];

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Fetch unread count every minute
            const interval = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Map of tab IDs to icons
    const tabIcons = {
        "profile": User,
        "settings": Settings,
        "categories": List,
        "analytics": BarChart2,
        "portfolio": Folder,
        "worker-profile": User,
        "bookings": Calendar,
        "jobs": Briefcase,
        "admin-job-approval": Clock,
        "post-job": PlusCircle,
        "pending-jobs": Clock,
        "support": MessageSquare,
        "job-approval": Edit,
        "user-management": User,
        "cart": ShoppingCart,
        "payments": CreditCard,
        "reviews": Star,
        "notifications": Bell,
        "gamification": Trophy,
        "my-awards": Trophy,
        "reports": FileText
    };

    return (
        <div className="w-64 bg-gray-800 text-white h-screen fixed flex flex-col">
            {/* User Profile Section */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-semibold truncate">{displayName}</p>
                        <p className="text-sm text-gray-400 capitalize">{user?.role || 'Guest'}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto">
                <nav className="p-4 space-y-2">
                    {accessibleTabs.map((tab) => {
                        const Icon = tabIcons[tab.id] || Home;
                        const isNotificationTab = tab.id === 'notifications';
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    console.log("[SideBar] Clicking tab:", tab.id);
                                    setActiveTab(tab.id);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={20} />
                                    <span>{tab.label}</span>
                                </div>
                                <div className="flex items-center">
                                    {isNotificationTab && unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                                            {unreadCount}
                                        </span>
                                    )}
                                    <ChevronRight size={16} className={`transition-transform ${
                                        activeTab === tab.id ? 'rotate-90' : ''
                                    }`} />
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Logout Section */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;