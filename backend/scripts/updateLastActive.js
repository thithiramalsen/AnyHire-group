import { connectDB } from '../lib/db.js';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const updateLastActive = async () => {
    try {
        // Connect to MongoDB using the existing connection function
        await connectDB();
        console.log('Connected to MongoDB');

        // Update all users that don't have lastActive field
        const result = await User.updateMany(
            { lastActive: { $exists: false } },
            { $set: { lastActive: new Date() } }
        );

        console.log(`Updated ${result.modifiedCount} users`);
        
        // Close the connection using mongoose
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Run the update
updateLastActive();