import NotificationService from '../services/notification.service.js';

export const createNotification = async (userId, type, title, message, link = null) => {
    try {
        console.log('Creating notification:', { userId, type, title, message, link });
        return await NotificationService.createNotification(userId, type, title, message, link);
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

export const notificationTypes = {
    WELCOME: 'WELCOME',
    BOOKING: 'BOOKING',
    PAYMENT: 'PAYMENT',
    REVIEW: 'REVIEW',
    SYSTEM: 'SYSTEM'
};