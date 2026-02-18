import User from '../models/User.js';
import Order from '../models/Order.js';

// Calculate membership tier based on total spent
const calculateTier = (totalSpent) => {
    if (totalSpent >= 10000) return 'Gold';   // $10,000+
    if (totalSpent >= 5000) return 'Silver';  // $5,000+
    return 'Bronze';
};

// Get User Loyalty Points : /api/loyalty/points
export const getLoyaltyPoints = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            loyaltyPoints: user.loyaltyPoints,
            totalSpent: user.totalSpent,
            membershipTier: user.membershipTier
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Redeem Loyalty Points : /api/loyalty/redeem
export const redeemPoints = async (req, res) => {
    try {
        const { userId, pointsToRedeem } = req.body;

        if (!pointsToRedeem || pointsToRedeem < 100) {
            return res.json({ success: false, message: 'Minimum 100 points required to redeem' });
        }

        if (pointsToRedeem % 100 !== 0) {
            return res.json({ success: false, message: 'Points must be redeemed in multiples of 100' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.loyaltyPoints < pointsToRedeem) {
            return res.json({ success: false, message: 'Insufficient loyalty points' });
        }

        // Deduct points
        user.loyaltyPoints -= pointsToRedeem;
        await user.save();

        // Calculate discount (100 points = $10)
        const discountAmount = (pointsToRedeem / 100) * 10;

        res.json({
            success: true,
            message: 'Points redeemed successfully',
            discountAmount,
            remainingPoints: user.loyaltyPoints
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Award Points After Order : /api/loyalty/award
export const awardPoints = async (req, res) => {
    try {
        const { userId, orderAmount } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Award 1 point per $10 spent
        const pointsEarned = Math.floor(orderAmount / 10);

        user.loyaltyPoints += pointsEarned;
        user.totalSpent += orderAmount;
        user.membershipTier = calculateTier(user.totalSpent);

        await user.save();

        res.json({
            success: true,
            message: `Earned ${pointsEarned} points!`,
            pointsEarned,
            totalPoints: user.loyaltyPoints,
            membershipTier: user.membershipTier
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Loyalty History : /api/loyalty/history
export const getLoyaltyHistory = async (req, res) => {
    try {
        const { userId } = req.body;

        // Get all completed orders for this user
        const orders = await Order.find({
            userId,
            status: 'Delivered'
        }).sort({ createdAt: -1 }).limit(20);

        const history = orders.map(order => ({
            orderId: order._id,
            date: order.createdAt,
            amount: order.amount,
            pointsEarned: Math.floor(order.amount / 10)
        }));

        res.json({
            success: true,
            history
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
