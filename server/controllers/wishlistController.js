import User from '../models/User.js';

// Add to Wishlist : /api/wishlist/add
export const addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Check if already in wishlist
        if (user.wishlist.includes(productId)) {
            return res.json({ success: false, message: 'Already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        res.json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Remove from Wishlist : /api/wishlist/remove
export const removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Wishlist : /api/wishlist/get
export const getWishlist = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId).populate('wishlist');
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            wishlist: user.wishlist
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Toggle Wishlist : /api/wishlist/toggle
export const toggleWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const index = user.wishlist.findIndex(id => id.toString() === productId);

        if (index > -1) {
            // Remove from wishlist
            user.wishlist.splice(index, 1);
            await user.save();
            res.json({ success: true, message: 'Removed from wishlist', inWishlist: false });
        } else {
            // Add to wishlist
            user.wishlist.push(productId);
            await user.save();
            res.json({ success: true, message: 'Added to wishlist', inWishlist: true });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
