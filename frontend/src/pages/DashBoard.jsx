import { useState } from "react";
import Sidebar from "../Components/SideBar";
import ProfileTab from "../Components/ProfileTab";
import PortfolioTab from "../Components/PortfolioTab";
import CategoriesTab from "../Components/CategoriesTab";
import AnalyticsTab from "../Components/AnalyticsTab";
import BookingsTab from "../Components/BookingsTab";
import JobsTab from "../Components/JobsTab";
import JobsPendingTab from "../Components/JobsPendingTab";

import { rolePermissions } from "../lib/rolePermissions";
import { useUserStore } from "../stores/useUserStore";

const DashBoard = () => {
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState("profile");

    // Get accessible tabs based on the user's role
    const accessibleTabs = rolePermissions[user?.role] || [];

    return (
        <div className="flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 ml-64 p-8">
                {accessibleTabs.includes("profile") && activeTab === "profile" && <ProfileTab />}
                {accessibleTabs.includes("settings") && activeTab === "settings" && <SettingsTab />}
                {accessibleTabs.includes("categories") && activeTab === "categories" && <CategoriesTab />}
                {accessibleTabs.includes("analytics") && activeTab === "analytics" && <AnalyticsTab />}
                {accessibleTabs.includes("portfolio") && activeTab === "portfolio" && <PortfolioTab />}
                {accessibleTabs.includes("bookings") && activeTab === "bookings" && <BookingsTab />}
                {accessibleTabs.includes("jobs") && activeTab === "jobs" && <JobsTab />}
                {accessibleTabs.includes("pending-jobs") && activeTab === "pending-jobs" && <PendingJobsTab />}
            </div>
        </div>
    );
};

export default DashBoard;