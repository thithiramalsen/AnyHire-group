import { useState } from "react";
import { rolePermissions } from "../lib/rolePermissions";
import { useUserStore } from "../stores/useUserStore";
import SideBar from "../Components/SideBar";

// Import all tab components
import ProfileTab from "../Components/ProfileTab";
import AnalyticsTab from "../Components/AnalyticsTab";
import JobApprovalTab from "../Components/JobApprovalTab";
import BookingsTab from "../Components/BookingsTab";
import JobPostingTab from "../Components/JobPostingTab";
import PortfolioTab from "../Components/PortfolioTab";
import WorkerProfileTab from "../Components/WorkerProfileTab";
import JobsTab from "../Components/MyJobs";
import CategoriesTab from "../Components/CategoriesTab";
import SupportUserTab from "../Components/SupportUserTab";
import SupportAdminTab from "../Components/SupportAdminTab";
import ContactAdminTab from "../Components/admin/ContactAdminTab";
import UserManagementTab from "../Components/UserManagementTab";
import PendingJobsTab from "../Components/PendingJobsTab";
import CartTab from "../Components/CartTab";
import BookingsManagement from "../Components/admin/BookingsManagement";
import PaymentsManagement from "../Components/admin/PaymentsManagement";
import ReviewManagementTab from "../Components/admin/ReviewManagementTab";
import ReviewsTab from "../Components/ReviewsTab";
import NotificationTab from "../Components/NotificationTab";
import GamificationManagementTab from "../Components/admin/GamificationManagementTab";
import MyAwards from "../Components/MyAwards";

// Component mapping
const componentMap = {
    ProfileTab,
    AnalyticsTab,
    JobApprovalTab,
    BookingsTab,
    JobPostingTab,
    PortfolioTab,
    WorkerProfileTab,
    JobsTab,
    CategoriesTab,
    SupportUserTab,
    ContactAdminTab,
    SupportAdminTab,
    UserManagementTab,
    PendingJobsTab,
    CartTab,
    BookingsManagement,
    PaymentsManagement,
    ReviewManagementTab,
    ReviewsTab,
    NotificationTab,
    GamificationManagementTab,
    MyAwards
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