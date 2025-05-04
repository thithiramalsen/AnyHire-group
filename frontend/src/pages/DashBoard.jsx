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
import JobsTab from "../Components/MyJobs";
import CategoriesTab from "../Components/CategoriesTab";
import SupportUserTab from "../Components/SupportUserTab";
import SupportAdminTab from "../Components/SupportAdminTab";
import UserManagementTab from "../Components/UserManagementTab";
import PendingJobsTab from "../Components/PendingJobsTab";
import CartTab from "../Components/CartTab";

// Component mapping
const componentMap = {
    ProfileTab,
    AnalyticsTab,
    JobApprovalTab,
    BookingsTab,
    JobPostingTab,
    PortfolioTab,
    JobsTab,
    CategoriesTab,
    SupportUserTab,
    SupportAdminTab,
    UserManagementTab,
    PendingJobsTab,
    CartTab
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
                {TabComponent && <TabComponent />}
            </div>
        </div>
    );
};

export default DashBoard;