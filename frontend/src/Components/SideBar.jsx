import { 
    User, Edit, Settings, List, BarChart2, Folder, Calendar, 
    Briefcase, Clock, PlusCircle, MessageSquare, ShoppingCart,
    Home, LogOut, ChevronRight, CreditCard, Star, Users, FileText
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { rolePermissions } from "../lib/rolePermissions";
import { useState } from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useUserStore();
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [currentAnalyticsTab, setCurrentAnalyticsTab] = useState("analytics-users");

    // Get first and last name from the name field
    const displayName = user?.name || 'User';

    // Get the accessible tabs based on user role
    const accessibleTabs = user?.role ? rolePermissions[user.role]?.tabs || [] : [];

    // Fallback to default tab if no accessible tabs are found
    if (accessibleTabs.length === 0) {
        accessibleTabs.push({ id: "profile", label: "Profile", component: "ProfileTab" });
    }

    // Map of tab IDs to icons
    const tabIcons = {
        "profile": User,
        "settings": Settings,
        "categories": List,
        "analytics": BarChart2,
        "analytics-users": Users,
        "analytics-jobs": Briefcase,
        "analytics-bookings": Calendar,
        "analytics-payments": CreditCard,
        "analytics-ratings": Star,
        "analytics-support": MessageSquare,
        "portfolio": Folder,
        "bookings": Calendar,
        "jobs": Briefcase,
        "admin-job-approval": Clock,
        "post-job": PlusCircle,
        "pending-jobs": Clock,
        "support": MessageSquare,
        "job-approval": Edit,
        "user-management": User,
        "cart": ShoppingCart,
        "payments": CreditCard
    };

    const analyticsTabs = [
        { id: "analytics-users", label: "Users Analytics" },
        { id: "analytics-jobs", label: "Jobs Analytics" },
        { id: "analytics-bookings", label: "Bookings Analytics" },
        { id: "analytics-payments", label: "Payments Analytics" },
        { id: "analytics-ratings", label: "Ratings Analytics" },
        { id: "analytics-support", label: "Support Analytics" }
    ];

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
                        
                        if (tab.id === "analytics") {
                            return (
                                <div key={tab.id} className="space-y-1">
                                    <button
                                        onClick={() => {
                                            console.log("[SideBar] Clicking tab:", tab.id);
                                            setIsAnalyticsOpen(!isAnalyticsOpen);
                                            setActiveTab("analytics");
                                            setCurrentAnalyticsTab("analytics-users");
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                            isAnalyticsOpen
                                                ? 'bg-emerald-500 text-white'
                                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={20} />
                                            <span>{tab.label}</span>
                                        </div>
                                        <ChevronRight size={16} className={`transition-transform ${
                                            isAnalyticsOpen ? 'rotate-90' : ''
                                        }`} />
                                    </button>
                                    
                                    {isAnalyticsOpen && (
                                        <div className="pl-4 space-y-1">
                                            {tab.subTabs?.map((subTab) => (
                                                <button
                                                    key={subTab.id}
                                                    onClick={() => {
                                                        console.log("[SideBar] Clicking analytics sub-tab:", subTab.id);
                                                        setCurrentAnalyticsTab(subTab.id);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                                                        currentAnalyticsTab === subTab.id
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon size={18} />
                                                        <span>{subTab.label}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    console.log("[SideBar] Clicking tab:", tab.id);
                                    if (tab.id === "analytics") {
                                        setIsAnalyticsOpen(!isAnalyticsOpen);
                                        setActiveTab("analytics");
                                        setCurrentAnalyticsTab("analytics-users");
                                    } else {
                                        setActiveTab(tab.id);
                                    }
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
                                <ChevronRight size={16} className={`transition-transform ${
                                    activeTab === tab.id ? 'rotate-90' : ''
                                }`} />
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