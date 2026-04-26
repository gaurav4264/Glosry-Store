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

// Badge tiers based on TOTAL completed order count
const BADGE_TIERS = [
    { id: 'rookie',   label: 'Rookie',   emoji: '🌱', minOrders: 0,  color: '#6b7280', description: 'Welcome to Glosry!' },
    { id: 'bronze',   label: 'Bronze',   emoji: '🥉', minOrders: 3,  color: '#cd7f32', description: '3 orders completed' },
    { id: 'silver',   label: 'Silver',   emoji: '🥈', minOrders: 10, color: '#a8a9ad', description: '10 orders completed' },
    { id: 'gold',     label: 'Gold',     emoji: '🥇', minOrders: 20, color: '#ffd700', description: '20 orders completed' },
    { id: 'platinum', label: 'Platinum', emoji: '💎', minOrders: 50, color: '#b9f2ff', description: '50 orders completed' },
];

// Get User Badges : POST /api/loyalty/badges
export const getUserBadges = async (req, res) => {
    try {
        const { userId } = req.body;

        const totalOrders = await Order.countDocuments({ userId, status: 'Delivered' });

        // Find current badge (highest tier unlocked)
        let currentBadge = BADGE_TIERS[0];
        for (const tier of BADGE_TIERS) {
            if (totalOrders >= tier.minOrders) currentBadge = tier;
        }

        // Find next badge
        const currentIndex = BADGE_TIERS.findIndex(t => t.id === currentBadge.id);
        const nextBadge = currentIndex < BADGE_TIERS.length - 1 ? BADGE_TIERS[currentIndex + 1] : null;

        // Progress toward next badge
        const prevMin = currentBadge.minOrders;
        const nextMin = nextBadge ? nextBadge.minOrders : currentBadge.minOrders;
        const progress = nextBadge
            ? Math.min(100, Math.round(((totalOrders - prevMin) / (nextMin - prevMin)) * 100))
            : 100;

        return res.json({
            success: true,
            totalOrders,
            currentBadge,
            nextBadge,
            progress,
            ordersToNext: nextBadge ? Math.max(0, nextBadge.minOrders - totalOrders) : 0,
            allTiers: BADGE_TIERS,
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ─── Spin Status (no side effects) : POST /api/loyalty/spin-status ───────────
export const spinStatus = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });

        const now = new Date();
        const todayIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        todayIST.setHours(0, 0, 0, 0);

        let alreadySpun = false, hoursLeft = 0, minsLeft = 0;

        if (user.lastSpinDate) {
            const lastIST = new Date(user.lastSpinDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            lastIST.setHours(0, 0, 0, 0);
            if (lastIST.getTime() === todayIST.getTime()) {
                alreadySpun = true;
                const nextMidnightIST = new Date(todayIST);
                nextMidnightIST.setDate(nextMidnightIST.getDate() + 1);
                const msLeft = nextMidnightIST - now;
                hoursLeft = Math.floor(msLeft / 3600000);
                minsLeft  = Math.floor((msLeft % 3600000) / 60000);
            }
        }

        return res.json({
            success: true,
            spinPoints: user.spinPoints || 0,
            alreadySpun,
            hoursLeft,
            minsLeft,
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ─── Daily Spin Wheel : POST /api/loyalty/spin ───────────────────────────────
export const dailySpin = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });

        // Check if already spun today (compare IST date)
        const now = new Date();
        const todayIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        todayIST.setHours(0, 0, 0, 0);

        if (user.lastSpinDate) {
            const lastIST = new Date(user.lastSpinDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            lastIST.setHours(0, 0, 0, 0);
            if (lastIST.getTime() === todayIST.getTime()) {
                const nextMidnightIST = new Date(todayIST);
                nextMidnightIST.setDate(nextMidnightIST.getDate() + 1);
                const msUntilReset = nextMidnightIST - now;
                const hoursLeft = Math.floor(msUntilReset / 3600000);
                const minsLeft  = Math.floor((msUntilReset % 3600000) / 60000);
                return res.json({
                    success: false,
                    alreadySpun: true,
                    message: `Already spun today! Next spin in ${hoursLeft}h ${minsLeft}m`,
                    hoursLeft,
                    minsLeft,
                });
            }
        }

        // Award 2 spin points
        user.spinPoints  = (user.spinPoints || 0) + 2;
        user.lastSpinDate = now;
        await user.save();

        return res.json({
            success: true,
            message: '🎉 You won 2 Spin Points!',
            pointsEarned: 2,
            totalSpinPoints: user.spinPoints,
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ─── Redeem Spin Points : POST /api/loyalty/spin-redeem ──────────────────────
export const redeemSpinPoints = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });

        if ((user.spinPoints || 0) < 200) {
            return res.json({ success: false, message: 'You need at least 200 spin points to redeem' });
        }

        // Deduct 200 spin points → ₹40 discount
        user.spinPoints -= 200;
        await user.save();

        return res.json({
            success: true,
            message: '🎁 200 Spin Points redeemed for ₹40 discount!',
            discountAmount: 40,
            remainingSpinPoints: user.spinPoints,
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
