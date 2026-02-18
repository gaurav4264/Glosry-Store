import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Essential categories prioritized first
const ESSENTIAL_CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Meat', 'Bakery'];

// Get Smart Budget Bag : POST /api/budget/smart-bag
export const getSmartBag = async (req, res) => {
    try {
        const { userId, budget, priorities } = req.body;

        if (!budget || budget <= 0) {
            return res.json({ success: false, message: 'Please provide a valid budget amount' });
        }

        const allProducts = await Product.find({ stockQuantity: { $gt: 0 } }).sort({ offerPrice: 1 });

        // Priority categories (user-selected or default essentials)
        const priorityCategories = priorities && priorities.length > 0 ? priorities : ESSENTIAL_CATEGORIES;

        // AI Algorithm: Maximize value within budget
        let remainingBudget = budget;
        const smartBag = [];
        const categoryCoverage = {};

        // Step 1: Add one essential item from each priority category
        for (const category of priorityCategories) {
            const categoryProducts = allProducts.filter(p => p.category === category && p.offerPrice <= remainingBudget);
            if (categoryProducts.length > 0) {
                // Pick best value: highest savings ratio
                const bestValue = categoryProducts.sort((a, b) => {
                    const savingsA = (a.price - a.offerPrice) / a.price;
                    const savingsB = (b.price - b.offerPrice) / b.price;
                    return savingsB - savingsA;
                })[0];

                smartBag.push({
                    product: bestValue,
                    quantity: 1,
                    reason: 'Essential item - best value in category'
                });
                remainingBudget -= bestValue.offerPrice;
                categoryCoverage[category] = true;
            }
        }

        // Step 2: Fill remaining budget with best deals
        const usedIds = smartBag.map(i => i.product._id.toString());
        const remainingProducts = allProducts.filter(p =>
            !usedIds.includes(p._id.toString()) && p.offerPrice <= remainingBudget
        );

        // Sort by savings percentage (best deals first)
        const deals = remainingProducts.sort((a, b) => {
            const savingsA = ((a.price - a.offerPrice) / a.price) * 100;
            const savingsB = ((b.price - b.offerPrice) / b.price) * 100;
            return savingsB - savingsA;
        });

        for (const product of deals) {
            if (product.offerPrice <= remainingBudget) {
                smartBag.push({
                    product,
                    quantity: 1,
                    reason: `${Math.round(((product.price - product.offerPrice) / product.price) * 100)}% savings deal`
                });
                remainingBudget -= product.offerPrice;
            }
        }

        // Calculate stats
        const totalOriginal = smartBag.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
        const totalOffer = smartBag.reduce((sum, i) => sum + (i.product.offerPrice * i.quantity), 0);
        const totalSaved = totalOriginal - totalOffer;
        const categoriesCount = [...new Set(smartBag.map(i => i.product.category))].length;

        res.json({
            success: true,
            smartBag,
            stats: {
                totalItems: smartBag.length,
                totalCost: Math.round(totalOffer * 100) / 100,
                totalSaved: Math.round(totalSaved * 100) / 100,
                savingsPercentage: totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0,
                remainingBudget: Math.round(remainingBudget * 100) / 100,
                budgetUsed: Math.round((budget - remainingBudget) * 100) / 100,
                categoriesCovered: categoriesCount
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Savings Tips : GET /api/budget/tips
export const getSavingsTips = async (req, res) => {
    try {
        const { userId } = req.body;

        const orders = await Order.find({ userId }).populate('items.product').sort({ createdAt: -1 }).limit(10);

        const tips = [];
        let totalSpent = 0;
        let totalSaved = 0;
        const categorySpend = {};

        for (const order of orders) {
            totalSpent += order.amount;
            for (const item of order.items) {
                if (item.product) {
                    const saved = (item.product.price - item.product.offerPrice) * item.quantity;
                    totalSaved += saved;
                    const cat = item.product.category;
                    categorySpend[cat] = (categorySpend[cat] || 0) + (item.product.offerPrice * item.quantity);
                }
            }
        }

        // Generate AI tips
        const topSpendCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0];
        if (topSpendCategory) {
            tips.push({ icon: '📊', tip: `You spend most on ${topSpendCategory[0]} (₹${Math.round(topSpendCategory[1])}). Consider buying in bulk!` });
        }

        if (totalSaved > 0) {
            tips.push({ icon: '💰', tip: `You've saved ₹${Math.round(totalSaved)} by choosing offer prices. Great job!` });
        }

        tips.push({ icon: '🕐', tip: 'Shop on weekdays for fresher stock and better deals!' });
        tips.push({ icon: '📦', tip: 'Buy seasonal fruits & vegetables — they\'re cheaper and fresher.' });
        tips.push({ icon: '🎯', tip: 'Use the Budget Bag feature to maximize your grocery value!' });

        if (orders.length > 3) {
            const avgOrder = totalSpent / orders.length;
            tips.push({ icon: '📈', tip: `Your average order is ₹${Math.round(avgOrder)}. Set a budget to control spending!` });
        }

        res.json({
            success: true,
            tips,
            summary: {
                totalOrders: orders.length,
                totalSpent: Math.round(totalSpent),
                totalSaved: Math.round(totalSaved),
                avgOrderValue: orders.length > 0 ? Math.round(totalSpent / orders.length) : 0
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get available categories : GET /api/budget/categories
export const getCategories = async (req, res) => {
    try {
        const products = await Product.find({ inStock: true });
        const categories = [...new Set(products.map(p => p.category))];
        const categoryInfo = categories.map(cat => {
            const catProducts = products.filter(p => p.category === cat);
            const minPrice = Math.min(...catProducts.map(p => p.offerPrice));
            const maxPrice = Math.max(...catProducts.map(p => p.offerPrice));
            return { name: cat, count: catProducts.length, minPrice, maxPrice };
        });
        res.json({ success: true, categories: categoryInfo });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
