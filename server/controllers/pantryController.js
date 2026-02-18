import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Default shelf life days by category
const SHELF_LIFE_DAYS = {
    'Vegetables': 5, 'Fruits': 7, 'Dairy': 10, 'Bakery': 3,
    'Meat': 3, 'Seafood': 2, 'Frozen': 90, 'Beverages': 180,
    'Snacks': 60, 'Grains': 120, 'Spices': 365, 'Canned': 730,
    'Instant Food': 180, 'Organic': 5, 'Baby Care': 365,
    'Personal Care': 730, 'Cleaning': 730, 'default': 30
};

const getShelfLifeDays = (category) => SHELF_LIFE_DAYS[category] || SHELF_LIFE_DAYS['default'];

// Calculate freshness status
const getStatus = (expiryDate) => {
    if (!expiryDate) return 'no-expiry';
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return 'expired';
    if (daysLeft <= 2) return 'critical';
    if (daysLeft <= 5) return 'expiring-soon';
    return 'fresh';
};

// Set Expiry Date for Product : POST /api/pantry/set-expiry
export const setProductExpiry = async (req, res) => {
    try {
        const { productId, expiryDate, manufacturingDate } = req.body;
        if (!productId) return res.json({ success: false, message: 'Product ID is required' });

        const product = await Product.findById(productId);
        if (!product) return res.json({ success: false, message: 'Product not found' });

        if (expiryDate) product.expiryDate = new Date(expiryDate);
        if (manufacturingDate) product.manufacturingDate = new Date(manufacturingDate);

        // Auto-calculate expiry if only manufacturing date given
        if (manufacturingDate && !expiryDate) {
            const shelfDays = getShelfLifeDays(product.category);
            product.expiryDate = new Date(new Date(manufacturingDate).getTime() + shelfDays * 24 * 60 * 60 * 1000);
        }

        await product.save();
        res.json({ success: true, message: 'Expiry date updated', product });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Bulk Set Expiry : POST /api/pantry/bulk-set-expiry
export const bulkSetExpiry = async (req, res) => {
    try {
        const { items } = req.body; // [{productId, expiryDate}]
        if (!items || items.length === 0) return res.json({ success: false, message: 'No items provided' });

        let updated = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.expiryDate = new Date(item.expiryDate);
                if (item.manufacturingDate) product.manufacturingDate = new Date(item.manufacturingDate);
                await product.save();
                updated++;
            }
        }
        res.json({ success: true, message: `${updated} products updated`, count: updated });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get All Products with Expiry Info (Seller Dashboard) : GET /api/pantry/dashboard
export const getExpiryDashboard = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ expiryDate: 1 });

        const withExpiry = products.filter(p => p.expiryDate);
        const withoutExpiry = products.filter(p => !p.expiryDate);

        const now = new Date();

        const expired = withExpiry.filter(p => getStatus(p.expiryDate) === 'expired');
        const critical = withExpiry.filter(p => getStatus(p.expiryDate) === 'critical');
        const expiringSoon = withExpiry.filter(p => getStatus(p.expiryDate) === 'expiring-soon');
        const fresh = withExpiry.filter(p => getStatus(p.expiryDate) === 'fresh');

        // AI Tips for seller
        const tips = [];
        if (expired.length > 0) {
            tips.push({ icon: '🚨', type: 'danger', tip: `${expired.length} products EXPIRED! Remove from shelf immediately or offer heavy discount to clear stock.` });
        }
        if (critical.length > 0) {
            tips.push({ icon: '⚡', type: 'warning', tip: `${critical.length} products expire within 2 DAYS! Create a flash sale or bundle deal to sell quickly.` });
            const criticalNames = critical.slice(0, 3).map(p => p.name).join(', ');
            tips.push({ icon: '🏷️', type: 'action', tip: `Suggest discounting: ${criticalNames}${critical.length > 3 ? '...' : ''} — reduce price by 30-50% to clear stock!` });
        }
        if (expiringSoon.length > 0) {
            tips.push({ icon: '📢', type: 'info', tip: `${expiringSoon.length} products expiring within 5 days. Consider running a "Clearance Sale" campaign.` });
        }
        if (withoutExpiry.length > 0) {
            tips.push({ icon: '📝', type: 'info', tip: `${withoutExpiry.length} products don't have expiry dates set. Add dates for better tracking!` });
        }
        if (expired.length === 0 && critical.length === 0) {
            tips.push({ icon: '✅', type: 'success', tip: 'Great! No expired or critical products right now. Keep monitoring!' });
        }

        // Category-wise waste risk
        const categoryRisk = {};
        withExpiry.forEach(p => {
            if (!categoryRisk[p.category]) categoryRisk[p.category] = { total: 0, atRisk: 0, expired: 0 };
            categoryRisk[p.category].total++;
            if (getStatus(p.expiryDate) === 'expiring-soon' || getStatus(p.expiryDate) === 'critical') categoryRisk[p.category].atRisk++;
            if (getStatus(p.expiryDate) === 'expired') categoryRisk[p.category].expired++;
        });

        // Estimated loss from expired products
        const estimatedLoss = expired.reduce((sum, p) => sum + (p.offerPrice * p.stockQuantity), 0);
        const atRiskValue = [...critical, ...expiringSoon].reduce((sum, p) => sum + (p.offerPrice * p.stockQuantity), 0);

        res.json({
            success: true,
            dashboard: {
                summary: {
                    total: products.length,
                    withExpiry: withExpiry.length,
                    withoutExpiry: withoutExpiry.length,
                    expired: expired.length,
                    critical: critical.length,
                    expiringSoon: expiringSoon.length,
                    fresh: fresh.length,
                    estimatedLoss: Math.round(estimatedLoss),
                    atRiskValue: Math.round(atRiskValue)
                },
                expired,
                critical,
                expiringSoon,
                fresh,
                withoutExpiry,
                tips,
                categoryRisk
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Quick Discount for expiring products : POST /api/pantry/quick-discount
export const quickDiscount = async (req, res) => {
    try {
        const { productId, discountPercent } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.json({ success: false, message: 'Product not found' });

        const newOfferPrice = Math.round(product.price * (1 - discountPercent / 100));
        product.offerPrice = newOfferPrice;
        await product.save();

        res.json({ success: true, message: `Discounted to ₹${newOfferPrice} (${discountPercent}% off)`, product });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Auto-suggest expiry days : GET /api/pantry/shelf-life
export const getShelfLife = async (req, res) => {
    try {
        res.json({ success: true, shelfLife: SHELF_LIFE_DAYS });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
