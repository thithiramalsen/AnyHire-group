export const rolePermissions = {
    admin: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "analytics", label: "Analytics", component: "AnalyticsTab" },
            { id: "job-approval", label: "Job Approval", component: "JobApprovalTab" },
            { id: "bookings", label: "Bookings", component: "BookingsManagement" },
            { id: "payments", label: "Payments", component: "PaymentsManagement" },
            { id: "support", label: "Support", component: "SupportAdminTab" },
            { id: "user-management", label: "User Management", component: "UserManagementTab" },
            { id: "categories", label: "Categories", component: "CategoriesTab" }
        ]
    },
    customer: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "bookings", label: "Bookings", component: "BookingsTab" },
            { id: "post-job", label: "Post Job", component: "JobPostingTab" },
            { id: "support", label: "Support", component: "SupportUserTab" },
            { id: "pending-jobs", label: "Pending Jobs", component: "PendingJobsTab" },
        ]
    },
    jobSeeker: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "portfolio", label: "Portfolio", component: "PortfolioTab" },
            { id: "jobs", label: "Jobs", component: "JobsTab" },
            { id: "cart", label: "Cart", component: "CartTab" },
            { id: "support", label: "Support", component: "SupportUserTab" }
        ]
    }
};