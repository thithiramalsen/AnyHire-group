import { User, Edit, Settings, List, BarChart2, Folder, Calendar, Briefcase, Clock, PlusCircle } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { rolePermissions } from "../lib/rolePermissions";

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user } = useUserStore();

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "settings", label: "Settings", icon: Settings },
        { id: "categories", label: "Categories", icon: List },
        { id: "analytics", label: "Analytics", icon: BarChart2 },
        { id: "portfolio", label: "Portfolio", icon: Folder },
        { id: "bookings", label: "Bookings", icon: Calendar },
        { id: "jobs", label: "Jobs", icon: Briefcase },
        //{ id: "admin-approval", label: "Admin Approval", icon: Clock },
        { id: "post_job", label: "Post Job", icon: PlusCircle },
        { id: "pending-jobs", label: "Pending Jobs", icon: Clock }, // Added pending-jobs
    ];

    const accessibleTabs = tabs.filter((tab) =>
        rolePermissions[user?.role]?.includes(tab.id)
    );

    // Fallback to default tab if no accessible tabs are found
    if (accessibleTabs.length === 0) {
        accessibleTabs.push({ id: "profile", label: "Profile", icon: User });
    }

    return (
        <div className="w-64 bg-gray-800 text-white h-screen fixed">
            <div className="p-4 text-2xl font-bold text-center border-b border-gray-700">
                Dashboard
            </div>
            <nav className="mt-4">
                {accessibleTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-2 text-left ${
                            activeTab === tab.id
                                ? "bg-emerald-600"
                                : "hover:bg-gray-700"
                        }`}
                    >
                        <tab.icon className="mr-2" />
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;