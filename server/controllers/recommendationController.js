import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Get Personalized Recommendations : /api/recommend/personal
export const getPersonalRecommendations = async (req, res) => {
    try {
        const { userId } = req.body;

        // Get user's past orders
        const userOrders = await Order.find({ userId });

        if (userOrders.length === 0) {
            // New user - return popular/trending products
            const products = await Product.find({ inStock: true }).limit(8);
            return res.json({
                success: true,
                recommendations: products,
                reason: 'Popular Products'
            });
        }

        // Get categories user has purchased from
        const purchasedProductIds = [];
        userOrders.forEach(order => {
            order.items.forEach(item => {
                purchasedProductIds.push(item.product.toString());
            });
        });

        const purchasedProducts = await Product.find({ _id: { $in: purchasedProductIds } });
        const purchasedCategories = [...new Set(purchasedProducts.map(p => p.category))];

        // Recommend products from same categories they haven't bought
        const recommendations = await Product.find({
            category: { $in: purchasedCategories },
            _id: { $nin: purchasedProductIds }
            // inStock: true  <-- Removed
        }).limit(8);

        res.json({
            success: true,
            recommendations,
            reason: 'Based on your previous purchases'
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Frequently Bought Together : /api/recommend/frequently-bought/:productId
export const getFrequentlyBoughtTogether = async (req, res) => {
    try {
        const { productId } = req.params;

        // Find orders containing this product
        const orders = await Order.find({
            'items.product': productId
        });

        const targetProduct = await Product.findById(productId);
        if (!targetProduct) {
            return res.json({ success: false, message: 'Product not found' });
        }

        let recommendations = [];

        if (orders.length > 0) {
            // Count co-occurring products
            const coOccurrence = {};
            orders.forEach(order => {
                order.items.forEach(item => {
                    const itemId = item.product.toString();
                    if (itemId !== productId) {
                        coOccurrence[itemId] = (coOccurrence[itemId] || 0) + 1;
                    }
                });
            });

            // Get top 4 most frequently bought together
            const topProductIds = Object.entries(coOccurrence)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([id]) => id);

            if (topProductIds.length > 0) {
                recommendations = await Product.find({ _id: { $in: topProductIds } });
            }
        }

        // FALLBACK: If no co-occurring products found, recommend from the same category
        if (recommendations.length === 0) {
            recommendations = await Product.find({
                category: targetProduct.category,
                _id: { $ne: productId },
                inStock: true
            }).limit(4);
        }

        res.json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Trending Products : /api/recommend/trending
export const getTrendingProducts = async (req, res) => {
    try {
        // Get recent orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentOrders = await Order.find({
            createdAt: { $gte: thirtyDaysAgo }
        });

        let trendingProducts = [];

        if (recentOrders.length > 0) {
            // Count product occurrences
            const productCount = {};
            recentOrders.forEach(order => {
                order.items.forEach(item => {
                    const productId = item.product.toString();
                    productCount[productId] = (productCount[productId] || 0) + item.quantity;
                });
            });

            // Get top 8 trending products
            const trendingIds = Object.entries(productCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([id]) => id);

            if (trendingIds.length > 0) {
                trendingProducts = await Product.find({ _id: { $in: trendingIds } });
            }
        }

        // FALLBACK: If no recent orders, just return the latest/most popular 8 products
        if (trendingProducts.length === 0) {
            trendingProducts = await Product.find({ inStock: true }).sort({ createdAt: -1 }).limit(8);
        }

        res.json({
            success: true,
            trending: trendingProducts
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
