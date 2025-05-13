import CustomerRewardsService from '../services/customerRewards.service.js';
import Award from '../models/award.model.js';

export const calculateCustomerOfMonth = async (req, res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const award = await CustomerRewardsService.calculateCustomerOfMonth(month, year);
        
        if (!award) {
            return res.status(404).json({
                success: false,
                message: 'No eligible customers found for the period'
            });
        }

        res.status(200).json({
            success: true,
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCustomerOfMonth = async (req, res) => {
    try {
        const { month, year } = req.params;
        
        const award = await CustomerRewardsService.getCustomerOfMonth(
            parseInt(month),
            parseInt(year)
        );

        if (!award) {
            return res.status(404).json({
                success: false,
                message: 'No award found for the specified period'
            });
        }

        res.status(200).json({
            success: true,
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const validateDiscountCode = async (req, res) => {
    try {
        const { code } = req.body;
        
        const discountInfo = await CustomerRewardsService.validateDiscountCode(code);
        
        if (!discountInfo) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired discount code'
            });
        }

        res.status(200).json({
            success: true,
            data: discountInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllAwards = async (req, res) => {
    try {
        const awards = await CustomerRewardsService.getAllAwards();
        res.json({
            success: true,
            count: awards.length,
            data: awards
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyAwards = async (req, res) => {
    try {
        const userId = req.user._id;
        const awards = await CustomerRewardsService.getUserAwards(userId);
        
        res.json({
            success: true,
            data: awards
        });
    } catch (error) {
        console.error('Error in getMyAwards:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const calculateCustomerOfDay = async (req, res) => {
    try {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const award = await CustomerRewardsService.calculateCustomerOfDay(day, month, year);
        
        if (!award) {
            return res.status(404).json({
                success: false,
                message: 'No eligible customers found for today'
            });
        }

        res.status(200).json({
            success: true,
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCustomerOfDay = async (req, res) => {
    try {
        const { day, month, year } = req.params;
        
        const award = await CustomerRewardsService.getCustomerOfDay(
            parseInt(day),
            parseInt(month),
            parseInt(year)
        );

        if (!award) {
            return res.status(404).json({
                success: false,
                message: 'No award found for the specified date'
            });
        }

        res.status(200).json({
            success: true,
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const calculateTopSeekerOfMonth = async (req, res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const award = await CustomerRewardsService.calculateTopSeekerOfMonth(month, year);
        
        if (!award) {
            return res.status(404).json({
                success: false,
                message: 'No eligible seekers found for the period'
            });
        }

        res.status(200).json({
            success: true,
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const calculateTopSeekerOfDay = async (req, res) => {
    try {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const award = await CustomerRewardsService.calculateTopSeekerOfDay(day, month, year);
        
        if (!award) {
            return res.status(404).json({
                success: false,
                message: 'No eligible seekers found for today'
            });
        }

        res.status(200).json({
            success: true,
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getTopSeekerOfMonth = async (req, res) => {
    try {
        const { month, year } = req.params;
        
        const award = await CustomerRewardsService.getTopSeekerOfMonth(
            parseInt(month),
            parseInt(year)
        );

        if (!award) {
            return res.status(404).json({
                success: false,
                message: 'No award found for the specified period'
            });
        }

        res.status(200).json({
            success: true,
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getTopSeekerOfDay = async (req, res) => {
    try {
        const { day, month, year } = req.params;
        
        const award = await CustomerRewardsService.getTopSeekerOfDay(
            parseInt(day),
            parseInt(month),
            parseInt(year)
        );

        if (!award) {
            return res.status(404).json({
                success: false,
                message: 'No award found for the specified date'
            });
        }

        res.status(200).json({
            success: true,
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 


export const getUserAwards = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Add logging to debug
        console.log('Fetching awards for userId:', userId);
        
        // Ensure userId is a number
        const numericUserId = Number(userId);
        if (isNaN(numericUserId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        const awards = await Award.find({ userId: numericUserId })
            .sort({ issuedAt: -1 })
            .select('-__v') // Exclude version key
            .lean(); // Convert to plain JavaScript objects

        // Add logging to debug
        console.log('Found awards:', awards);

        return res.status(200).json({
            success: true,
            data: awards || [] // Ensure we always return an array
        });

    } catch (error) {
        console.error('Error in getUserAwards:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user awards',
            error: error.message
        });
    }
};