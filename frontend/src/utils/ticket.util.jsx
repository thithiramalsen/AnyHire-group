export const statusPriority = {
    "Open": 0,
    "In Progress": 1,
    "Resolved": 2,
    "Closed": 3
};

export const getStatusColor = (status) => {
    switch (status) {
        case "Open":
            return "bg-yellow-500";
        case "In Progress":
            return "bg-blue-500";
        case "Resolved":
            return "bg-green-500";
        case "Closed":
            return "bg-gray-500";
        default:
            return "bg-gray-500";
    }
};

export const sortTickets = (tickets) => {
    return [...tickets].sort((a, b) => {
        // First sort by priority (Urgent first)
        if (a.priority === "Urgent" && b.priority !== "Urgent") return -1;
        if (b.priority === "Urgent" && a.priority !== "Urgent") return 1;
        
        // Then by status priority
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];
        if (statusDiff !== 0) return statusDiff;
        
        // Finally by date
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
};