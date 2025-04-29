import { useState } from "react";
import { rolePermissions } from "../lib/rolePermissions";
import { useUserStore } from "../stores/useUserStore";

// Import all tab components
import ProfileTab from "../Components/ProfileTab";
import AnalyticsTab from "../Components/AnalyticsTab";
import JobApprovalTab from "../Components/JobApprovalTab";
import BookingsTab from "../Components/BookingsTab";
import JobPostingTab from "../Components/JobPostingTab";
import PortfolioTab from "../Components/PortfolioTab";
import JobsTab from "../Components/JobsTab";
import CategoriesTab from "../Components/CategoriesTab";
import SupportUserTab from "../Components/SupportUserTab";
import SupportAdminTab from "../Components/SupportAdminTab";
import UserManagementTab from "../Components/UserManagementTab";

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
    UserManagementTab
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
            <div className="w-64 bg-gray-800 h-screen fixed">
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Dashboard</h2>
                    <nav>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left px-4 py-2 mb-2 rounded ${
                                    activeTab === tab.id 
                                        ? 'bg-green-600 text-white' 
                                        : 'text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                {TabComponent && <TabComponent />}
            </div>
        </div>
    );
};

export default DashBoard;