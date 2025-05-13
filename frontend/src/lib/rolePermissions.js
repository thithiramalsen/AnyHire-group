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
                    { id: "jobs", label: "Jobs", component: "JobsAnalytics" },
                    { id: "bookings", label: "Bookings", component: "BookingsAnalytics" },
                    { id: "payments", label: "Payments", component: "PaymentsAnalytics" },
                    { id: "ratings", label: "Ratings", component: "RatingsAnalytics" },
                    { id: "support", label: "Support", component: "SupportAnalytics" }
                ]
            },
            { id: "reports", label: "Reports", component: "ReportsTab" },
            { id: "job-approval", label: "Job Approval", component: "JobApprovalTab" },
            { id: "bookings", label: "Bookings", component: "BookingsManagement" },
            { id: "payments", label: "Payments", component: "PaymentsManagement" },
            { id: "reviews", label: "Reviews", component: "ReviewManagementTab" },
            { id: "support", label: "Support", component: "SupportAdminTab" },
            { id: "contact", label: "Contact", component: "ContactAdminTab" },
            { id: "user-management", label: "User Management", component: "UserManagementTab" },
            { id: "categories", label: "Categories", component: "CategoriesTab" },
            { id: "gamification", label: "Gamification", component: "GamificationManagementTab" }
        ]
    },
    customer: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "notifications", label: "Notifications", component: "NotificationTab" },
            { id: "bookings", label: "Bookings", component: "BookingsTab" },
            { id: "post-job", label: "Post Job", component: "JobPostingTab" },
            { id: "reviews", label: "Reviews", component: "ReviewsTab" },
            { id: "support", label: "Support", component: "SupportUserTab" },
            { id: "pending-jobs", label: "Pending Jobs", component: "PendingJobsTab" },
            { id: "my-awards", label: "My Awards", component: "MyAwards" },
            { id: "reports", label: "Reports", component: "ReportsTab" }
        ]
    },
    jobSeeker: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "notifications", label: "Notifications", component: "NotificationTab" },
            { id: "worker-profile", label: "Worker Profile", component: "WorkerProfileTab" },
            { id: "jobs", label: "My Jobs", component: "JobsTab" },
            { id: "bookings", label: "Bookings", component: "BookingsTab" },
            { id: "post-job", label: "Post Job", component: "JobPostingTab" },
            { id: "pending-jobs", label: "Pending Jobs", component: "PendingJobsTab" },
            { id: "reviews", label: "Reviews", component: "ReviewsTab" },
            { id: "support", label: "Support", component: "SupportUserTab" },
            { id: "cart", label: "Cart", component: "CartTab" },
            { id: "my-awards", label: "My Awards", component: "MyAwards" },
            { id: "reports", label: "Reports", component: "ReportsTab" }
        ]
    }
};