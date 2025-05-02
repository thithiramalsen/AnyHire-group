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
        // First sort by status priority
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];
        if (statusDiff !== 0) return statusDiff;
        // Then sort by date (newest first within same status)
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
};