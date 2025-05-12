export const rolePermissions = {
    admin: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "notifications", label: "Notifications", component: "NotificationTab" },
            { 
                id: "analytics", 
                label: "Analytics", 
                component: "AnalyticsTab",
                subTabs: [
                    { id: "users", label: "Users", component: "UsersAnalytics" },
                    { id: "bookings", label: "Bookings", component: "BookingsAnalytics" },
                    { id: "payments", label: "Payments", component: "PaymentsAnalytics" },
                    { id: "ratings", label: "Ratings", component: "RatingsAnalytics" }
                ]
            },
            { id: "reports", label: "Reports", component: "ReportsTab" },
            { id: "bookings", label: "Bookings", component: "BookingsManagement" },
            { id: "payments", label: "Payments", component: "PaymentsManagement" },
            { id: "reviews", label: "Reviews", component: "ReviewManagementTab" },
            { id: "user-management", label: "User Management", component: "UserManagementTab" },
        ]
    },
    customer: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "notifications", label: "Notifications", component: "NotificationTab" },
            { id: "bookings", label: "Bookings", component: "BookingsTab" },
            { id: "reviews", label: "Reviews", component: "ReviewsTab" },
            { id: "reports", label: "Reports", component: "ReportsTab" }
        ]
    },
    jobSeeker: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "notifications", label: "Notifications", component: "NotificationTab" },
            { id: "jobs", label: "My Jobs", component: "JobsTab" },
            { id: "reviews", label: "Reviews", component: "ReviewsTab" },
            { id: "reports", label: "Reports", component: "ReportsTab" }
        ]
    }
};