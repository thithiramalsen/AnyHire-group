import { useState } from "react";
import { rolePermissions } from "../lib/rolePermissions";
import { useUserStore } from "../stores/useUserStore";
import SideBar from "../Components/SideBar";

// Import all tab components
import ProfileTab from "../Components/ProfileTab";
import AnalyticsTab from "../Components/AnalyticsTab";
import BookingsTab from "../Components/BookingsTab";

import JobsTab from "../Components/MyJobs";

import UserManagementTab from "../Components/UserManagementTab";

import BookingsManagement from "../Components/admin/BookingsManagement";
import PaymentsManagement from "../Components/admin/PaymentsManagement";
import ReviewManagementTab from "../Components/admin/ReviewManagementTab";
import ReviewsTab from "../Components/ReviewsTab";
import NotificationTab from "../Components/NotificationTab";

import ReportsTab from "../Components/Reports/ReportsTab";

// Component mapping
const componentMap = {
    ProfileTab,
    AnalyticsTab,
    BookingsTab,
    JobsTab,
    UserManagementTab,
    BookingsManagement,
    PaymentsManagement,
    ReviewManagementTab,
    ReviewsTab,
    NotificationTab,
    ReportsTab
};

const DashBoard = () => {
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState("profile");

    // Get the user's role configuration
    const roleConfig = rolePermissions[user?.role] || { tabs: [] };
    const { tabs } = roleConfig;

    // Get the current tab component
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const TabComponent = currentTab ? componentMap[currentTab.component] : null;

    return (
        <div className="flex">
            {/* Sidebar */}
            <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                {TabComponent ? (
                    <TabComponent />
                ) : (
                    <div className="text-center text-gray-400">
                        Select a tab from the sidebar
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashBoard;