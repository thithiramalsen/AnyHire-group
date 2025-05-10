import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

// Create a single notification
export const createNotification = async (userId, message, type, relatedId) => {
    try {
        const notification = new Notification({
            userId,
            message,
            type,
            relatedId
        });
        return await notification.save();
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

// Create notifications for multiple users
export const createBulkNotifications = async (notifications) => {
    try {
        return await Notification.insertMany(notifications);
    } catch (error) {
        console.error("Error creating bulk notifications:", error);
        throw error;
    }
};

// Job-related notification functions
export const notifyJobPosted = async (job, userId) => {
    try {
        // Notify job poster
        await createNotification(
            userId,
            `Your job post "${job.title}" is pending approval`,
            'job_status',
            job._id
        );

        // Notify all admins
        const admins = await User.find({ role: 'admin' });
        const adminNotifications = admins.map(admin => ({
            userId: admin._id,
            message: `New job post "${job.title}" has been added for approval`,
            type: 'job_approval',
            relatedId: job._id
        }));
        await createBulkNotifications(adminNotifications);
    } catch (error) {
        console.error("Error in notifyJobPosted:", error);
        throw error;
    }
};

export const notifyJobApproved = async (job) => {
    try {
        // Notify job poster
        await createNotification(
            job.postedBy,
            `Your job post "${job.title}" has been approved`,
            'job_status',
            job._id
        );

        // Notify all job seekers
        const jobSeekers = await User.find({ role: 'jobseeker' });
        const jobSeekerNotifications = jobSeekers.map(seeker => ({
            userId: seeker._id,
            message: `New job posted: "${job.title}"`,
            type: 'new_job',
            relatedId: job._id
        }));
        await createBulkNotifications(jobSeekerNotifications);
    } catch (error) {
        console.error("Error in notifyJobApproved:", error);
        throw error;
    }
};

export const notifyJobDeclined = async (job) => {
    try {
        await createNotification(
            job.postedBy,
            `Your job post "${job.title}" has been declined`,
            'job_status',
            job._id
        );
    } catch (error) {
        console.error("Error in notifyJobDeclined:", error);
        throw error;
    }
};

// Booking-related notification functions
export const notifyJobApplication = async (job, booking) => {
    try {
        console.log(job, booking);
        await createNotification(
            job.postedBy,
            `New application received for job "${job.title}"`,
            'job_application',
            booking._id
        );
    } catch (error) {
        console.error("Error in notifyJobApplication:", error);
        throw error;
    }
};

export const notifyApplicationStatus = async (job, booking, status) => {
    try {
        console.log(job, booking, status);
        await createNotification(
            booking.userId,
            status === 'accepted' 
                ? `Your application for "${job.title}" has been accepted`
                : `Your application for "${job.title}" has been rejected`,
            'application_status',
            booking._id
        );
    } catch (error) {
        console.error("Error in notifyApplicationStatus:", error);
        throw error;
    }
}; 