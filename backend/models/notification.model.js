import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: Number,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['job_status', 'job_approval', 'new_job', 'job_application', 'application_status'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: Number,
        refPath: 'onModel',
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 