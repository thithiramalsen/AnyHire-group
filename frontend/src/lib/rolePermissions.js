export const rolePermissions = {
    admin: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { 
                id: "analytics", 
                label: "Analytics", 
                component: "AnalyticsTab",
                subTabs: [
                    { id: "users", label: "Users", component: "UsersAnalytics" },
                    { id: "jobs", label: "Jobs", component: "JobsAnalytics" },
                    { id: "bookings", label: "Bookings", component: "BookingsAnalytics" },
                    { id: "payments", label: "Payments", component: "PaymentsAnalytics" },
                    { id: "ratings", label: "Ratings", component: "RatingsAnalytics" },
                    { id: "support", label: "Support", component: "SupportAnalytics" }
                ]
            },
            { id: "job-approval", label: "Job Approval", component: "JobApprovalTab" },
            { id: "bookings", label: "Bookings", component: "BookingsManagement" },
            { id: "payments", label: "Payments", component: "PaymentsManagement" },
            { id: "reviews", label: "Reviews", component: "ReviewManagementTab" },
            { id: "support", label: "Support", component: "SupportAdminTab" },
            { id: "user-management", label: "User Management", component: "UserManagementTab" },
            { id: "categories", label: "Categories", component: "CategoriesTab" },
            { id: "notifications", label: "Notifications", component: "NotificationsTab" }
        ]
    },
    customer: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "bookings", label: "Bookings", component: "BookingsTab" },
            { id: "post-job", label: "Post Job", component: "JobPostingTab" },
            { id: "reviews", label: "Reviews", component: "ReviewsTab" },
            { id: "support", label: "Support", component: "SupportUserTab" },
            { id: "pending-jobs", label: "Pending Jobs", component: "PendingJobsTab" },
            { id: "notifications", label: "Notifications", component: "NotificationsTab" }
        ]
    },
    jobSeeker: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "worker-profile", label: "Worker Profile", component: "WorkerProfileTab" },
            { id: "jobs", label: "My Jobs", component: "JobsTab" },
            { id: "bookings", label: "Bookings", component: "BookingsTab" },
            { id: "reviews", label: "Reviews", component: "ReviewsTab" },
            { id: "support", label: "Support", component: "SupportUserTab" },
            { id: "cart", label: "Cart", component: "CartTab" },
            { id: "notifications", label: "Notifications", component: "NotificationsTab" }
        ]
    }
};