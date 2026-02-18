import PantryItem from '../models/PantryItem.js';

// Default shelf life days by category
const SHELF_LIFE_DAYS = {
    'Vegetables': 5, 'Fruits': 7, 'Dairy': 10, 'Bakery': 3,
    'Meat': 3, 'Seafood': 2, 'Frozen': 90, 'Beverages': 180,
    'Snacks': 60, 'Grains': 120, 'Spices': 365, 'Canned': 730,
    'Instant Food': 180, 'Organic': 5, 'default': 30
};

const getShelfLife = (category) => SHELF_LIFE_DAYS[category] || SHELF_LIFE_DAYS['default'];

// Add Pantry Item
export const addPantryItem = async (req, res) => {
    try {
        const { userId, name, category, quantity, unit, expiryDate, notes } = req.body;
        if (!name || !category) return res.json({ success: false, message: 'Name and category are required' });

        let calculatedExpiry = expiryDate;
        if (!calculatedExpiry) {
            const days = getShelfLife(category);
            calculatedExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        }

        const item = await PantryItem.create({
            userId, name, category,
            quantity: quantity || 1,
            unit: unit || 'pcs',
            purchaseDate: new Date(),
            expiryDate: calculatedExpiry,
            notes: notes || ''
        });

        res.json({ success: true, message: 'Item added to pantry', item });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Pantry Items
export const getPantryItems = async (req, res) => {
    try {
        const items = await PantryItem.find({ userId: req.body.userId }).sort({ expiryDate: 1 });

        // Auto-update statuses
        const now = new Date();
        for (const item of items) {
            if (item.status === 'consumed') continue;
            const daysLeft = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
            let newStatus = 'fresh';
            if (daysLeft <= 0) newStatus = 'expired';
            else if (daysLeft <= 3) newStatus = 'expiring-soon';

            if (newStatus !== item.status) {
                item.status = newStatus;
                await item.save();
            }
        }

        res.json({ success: true, items });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Pantry Item
export const updatePantryItem = async (req, res) => {
    try {
        const { itemId, status, quantity } = req.body;
        const item = await PantryItem.findById(itemId);
        if (!item) return res.json({ success: false, message: 'Item not found' });

        if (status === 'consumed') {
            item.status = 'consumed';
            item.consumedQuantity = item.quantity;
        }
        if (quantity !== undefined) item.quantity = quantity;
        if (status && status !== 'consumed') item.status = status;

        await item.save();
        res.json({ success: true, message: 'Item updated', item });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Pantry Item
export const deletePantryItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        await PantryItem.findByIdAndDelete(itemId);
        res.json({ success: true, message: 'Item removed' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Expiry Alerts
export const getExpiryAlerts = async (req, res) => {
    try {
        const items = await PantryItem.find({ userId: req.body.userId, status: { $ne: 'consumed' } });
        const now = new Date();

        const expired = [], expiringToday = [], expiring3Days = [], expiring7Days = [];

        items.forEach(item => {
            const daysLeft = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 0) expired.push(item);
            else if (daysLeft === 1) expiringToday.push(item);
            else if (daysLeft <= 3) expiring3Days.push(item);
            else if (daysLeft <= 7) expiring7Days.push(item);
        });

        res.json({
            success: true,
            alerts: {
                total: expired.length + expiringToday.length + expiring3Days.length + expiring7Days.length,
                expired, expiringToday, expiring3Days, expiring7Days
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Waste Stats with AI Tips
export const getWasteStats = async (req, res) => {
    try {
        const items = await PantryItem.find({ userId: req.body.userId });

        const fresh = items.filter(i => i.status === 'fresh').length;
        const expiringSoon = items.filter(i => i.status === 'expiring-soon').length;
        const expired = items.filter(i => i.status === 'expired').length;
        const consumed = items.filter(i => i.status === 'consumed').length;
        const total = items.length;

        const consumedRate = total > 0 ? Math.round((consumed / total) * 100) : 0;
        const wasteRate = total > 0 ? Math.round((expired / total) * 100) : 0;
        const estimatedSavings = consumed * 30; // ~₹30 per item saved
        const co2Prevented = Math.round(consumed * 0.5 * 10) / 10; // ~0.5kg per item

        // AI Tips
        const tips = [];
        if (expired > 0) tips.push(`🚨 ${expired} items expired! Try buying smaller quantities next time.`);
        if (expiringSoon > 0) tips.push(`⚡ ${expiringSoon} items expiring soon — use them today or tomorrow!`);
        if (wasteRate > 30) tips.push(`📉 Your waste rate is ${wasteRate}%. Consider buying less perishable items in bulk.`);
        if (consumedRate > 80) tips.push(`🌟 Amazing! ${consumedRate}% consumption rate — you're a waste-reducing champion!`);
        if (fresh > 0 && expired === 0 && expiringSoon === 0) tips.push(`✅ All ${fresh} items are fresh — great pantry management!`);
        if (total === 0) tips.push(`📝 Start by adding items you bought today. We'll track freshness for you!`);
        if (consumed > 5) tips.push(`💪 You've consumed ${consumed} items without waste — keep it up!`);

        res.json({
            success: true,
            stats: { fresh, expiringSoon, expired, consumed, total, consumedRate, wasteRate, estimatedSavings, co2Prevented, tips }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
