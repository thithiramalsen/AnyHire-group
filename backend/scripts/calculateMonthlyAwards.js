import dotenv from 'dotenv';
import { connectDB } from '../lib/db.js';
import CustomerRewardsService from '../services/customerRewards.service.js';

dotenv.config();

async function calculateMonthlyAwards() {
    try {
        await connectDB();
        
        const now = new Date();
        const previousMonth = now.getMonth();
        const year = now.getFullYear();
        
        console.log(`Calculating Customer of the Month for ${previousMonth + 1}/${year}`);
        
        const award = await CustomerRewardsService.calculateCustomerOfMonth(previousMonth + 1, year);
        
        if (award) {
            console.log('Successfully calculated Customer of the Month:', award);
        } else {
            console.log('No eligible customers found for the period');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error calculating monthly awards:', error);
        process.exit(1);
    }
}

calculateMonthlyAwards(); 