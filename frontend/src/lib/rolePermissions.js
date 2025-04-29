export const rolePermissions = {
    admin: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "analytics", label: "Analytics", component: "AnalyticsTab" },
            { id: "job-approval", label: "Job Approval", component: "JobApprovalTab" },
            { id: "support", label: "Support", component: "SupportAdminTab" },
            { id: "user-management", label: "User Management", component: "UserManagementTab" }
        ]
    },
    customer: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "bookings", label: "Bookings", component: "BookingsTab" },
            { id: "post-job", label: "Post Job", component: "JobPostingTab" },
            { id: "support", label: "Support", component: "SupportUserTab" }
        ]
    },
    jobSeeker: {
        tabs: [
            { id: "profile", label: "Profile", component: "ProfileTab" },
            { id: "portfolio", label: "Portfolio", component: "PortfolioTab" },
            { id: "jobs", label: "Jobs", component: "JobsTab" },
            { id: "support", label: "Support", component: "SupportUserTab" }
        ]
    }
};