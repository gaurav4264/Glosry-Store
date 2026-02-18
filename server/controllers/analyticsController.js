import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Get Revenue Statistics : /api/analytics/revenue
export const getRevenueStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        // Include both COD orders and paid online orders
        const query = {
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        };

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(query);

        const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        res.json({
            success: true,
            stats: {
                totalRevenue: Math.floor(totalRevenue * 100) / 100,
                totalOrders,
                averageOrderValue: Math.floor(averageOrderValue * 100) / 100
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Top Selling Products : /api/analytics/top-products
export const getTopProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.body;

        // Include both COD orders and paid online orders
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        });

        // Count product occurrences
        const productCount = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const productId = item.product.toString();
                productCount[productId] = (productCount[productId] || 0) + item.quantity;
            });
        });

        // Get product details
        const productIds = Object.keys(productCount);
        const products = await Product.find({ _id: { $in: productIds } });

        const topProducts = products.map(product => ({
            _id: product._id,
            name: product.name,
            image: product.image[0],
            soldCount: productCount[product._id.toString()],
            revenue: product.offerPrice * productCount[product._id.toString()]
        })).sort((a, b) => b.soldCount - a.soldCount).slice(0, limit);

        res.json({
            success: true,
            topProducts
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Sales Trends : /api/analytics/trends
export const getSalesTrends = async (req, res) => {
    try {
        const { period = 'daily' } = req.body; // daily, weekly, monthly

        const now = new Date();
        let startDate;

        if (period === 'daily') {
            startDate = new Date(now.setDate(now.getDate() - 30));
        } else if (period === 'weekly') {
            startDate = new Date(now.setDate(now.getDate() - 90));
        } else {
            startDate = new Date(now.setMonth(now.getMonth() - 12));
        }

        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }],
            createdAt: { $gte: startDate }
        }).sort({ createdAt: 1 });

        // Group by date
        const trends = orders.reduce((acc, order) => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, revenue: 0, orders: 0 };
            }
            acc[date].revenue += order.amount;
            acc[date].orders += 1;
            return acc;
        }, {});

        const trendsArray = Object.values(trends);

        res.json({
            success: true,
            trends: trendsArray
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Customer Statistics : /api/analytics/customers
export const getCustomerStats = async (req, res) => {
    try {
        // Include both COD orders and paid online orders
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        });

        // Count unique customers
        const uniqueCustomers = new Set(orders.map(order => order.userId.toString()));
        const totalCustomers = uniqueCustomers.size;

        // Calculate repeat customers (more than 1 order)
        const customerOrderCount = {};
        orders.forEach(order => {
            const userId = order.userId.toString();
            customerOrderCount[userId] = (customerOrderCount[userId] || 0) + 1;
        });

        const repeatCustomers = Object.values(customerOrderCount).filter(count => count > 1).length;

        res.json({
            success: true,
            customerStats: {
                totalCustomers,
                repeatCustomers,
                repeatRate: totalCustomers > 0 ? Math.floor((repeatCustomers / totalCustomers) * 100) : 0
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
// Get Top Customers : /api/analytics/customers/top
export const getTopCustomers = async (req, res) => {
    try {
        // Since we update User.totalSpent in orderController, we can just query the User model
        const topCustomers = await User.find({})
            .sort({ totalSpent: -1 })
            .limit(5)
            .select('name email totalSpent loyaltyPoints membershipTier');

        res.json({
            success: true,
            topCustomers
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
