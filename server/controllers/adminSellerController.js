import SellerApplication from '../models/SellerApplication.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Get All Applications : GET /api/admin/sellers
export const getAllApplications = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status && status !== 'all') filter.status = status;

        const total = await SellerApplication.countDocuments(filter);
        const applications = await SellerApplication.find(filter)
            .select('applicationNumber shopRegNumber sellerId fullName email mobileNumber shopName shopCategory city state area status registrationDate approvedAt passportPhoto shopLogo')
            .sort({ registrationDate: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        return res.json({ success: true, applications, total, page: Number(page) });
    } catch (error) {
        console.error('getAllApplications error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get Single Application : GET /api/admin/sellers/:id
export const getApplicationById = async (req, res) => {
    try {
        const application = await SellerApplication.findById(req.params.id);
        if (!application) return res.json({ success: false, message: 'Application not found' });
        return res.json({ success: true, application });
    } catch (error) {
        console.error('getApplicationById error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Update Application Status : PUT /api/admin/sellers/:id/status
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status, adminRemarks } = req.body;
        const validStatuses = ['pending', 'approved', 'rejected', 'hold'];
        if (!validStatuses.includes(status)) return res.json({ success: false, message: 'Invalid status value.' });

        const application = await SellerApplication.findById(req.params.id);
        if (!application) return res.json({ success: false, message: 'Application not found' });

        application.status = status;
        if (adminRemarks !== undefined) application.adminRemarks = adminRemarks;
        if (status === 'approved') application.approvedAt = new Date();

        await application.save();
        return res.json({
            success: true,
            message: `Application ${status} successfully.`,
            application: {
                _id: application._id,
                applicationNumber: application.applicationNumber,
                sellerId: application.sellerId,
                status: application.status,
                adminRemarks: application.adminRemarks,
                approvedAt: application.approvedAt
            }
        });
    } catch (error) {
        console.error('updateApplicationStatus error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get Seller Stats : GET /api/admin/sellers/stats
export const getSellerStats = async (req, res) => {
    try {
        const total = await SellerApplication.countDocuments();
        const pending = await SellerApplication.countDocuments({ status: 'pending' });
        const approved = await SellerApplication.countDocuments({ status: 'approved' });
        const rejected = await SellerApplication.countDocuments({ status: 'rejected' });
        const hold = await SellerApplication.countDocuments({ status: 'hold' });
        return res.json({ success: true, stats: { total, pending, approved, rejected, hold } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Vendor's Products (Admin view) : GET /api/admin/vendor-products/:vendorDbId
export const getVendorProductsAdmin = async (req, res) => {
    try {
        const { vendorDbId } = req.params;
        const products = await Product.find({ vendorId: vendorDbId })
            .select('name image offerPrice price category inStock stockQuantity createdAt vendorShopName')
            .sort({ createdAt: -1 });
        return res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Orders (Admin) : GET /api/admin/all-orders
export const getAllOrdersAdmin = async (req, res) => {
    try {
        const { city, sellerId, startDate, endDate, status, shopCategory, page = 1, limit = 30 } = req.query;

        // Build order filter
        const orderFilter = {};
        if (status && status !== 'all') orderFilter.status = status;
        if (sellerId) orderFilter.sellerId = sellerId;
        if (startDate || endDate) {
            orderFilter.createdAt = {};
            if (startDate) orderFilter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                orderFilter.createdAt.$lte = end;
            }
        }

        let orders = await Order.find(orderFilter)
            .populate('address')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // Filter by city or shopCategory (requires seller lookup)
        if (city || shopCategory) {
            const sellerFilter = {};
            if (city) sellerFilter.city = { $regex: city, $options: 'i' };
            if (shopCategory) sellerFilter.shopCategory = { $regex: shopCategory, $options: 'i' };
            const matchedSellers = await SellerApplication.find(sellerFilter).select('sellerId');
            const matchedSellerIds = matchedSellers.map(s => s.sellerId);
            orders = orders.filter(o => o.sellerId && matchedSellerIds.includes(o.sellerId));
        }

        // Enrich orders with seller info
        const sellerIds = [...new Set(orders.map(o => o.sellerId).filter(Boolean))];
        const sellers = await SellerApplication.find({ sellerId: { $in: sellerIds } })
            .select('sellerId shopName city area shopLogo');
        const sellerMap = {};
        sellers.forEach(s => { sellerMap[s.sellerId] = s; });

        const enrichedOrders = orders.map(order => ({
            _id: order._id,
            status: order.status,
            vendorStatus: order.vendorStatus || 'Pending',
            trackingId: order.trackingId || null,
            paymentType: order.paymentType,
            isPaid: order.isPaid,
            amount: order.amount,
            discount: order.discount || 0,
            sellerId: order.sellerId || null,
            sellerInfo: order.sellerId ? sellerMap[order.sellerId] || null : null,
            address: order.address,
            itemCount: order.items?.length || 0,
            createdAt: order.createdAt,
        }));

        const total = await Order.countDocuments(orderFilter);
        const totalRevenue = orders.reduce((s, o) => s + (o.amount || 0), 0);
        const COMMISSION_RATE = 0.05; // 5%

        return res.json({
            success: true,
            orders: enrichedOrders,
            total,
            page: Number(page),
            totalRevenue,
            commission: Math.round(totalRevenue * COMMISSION_RATE)
        });
    } catch (error) {
        console.error('getAllOrdersAdmin error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Revenue Stats : GET /api/admin/revenue-stats
export const getAdminRevenueStats = async (req, res) => {
    try {
        const allOrders = await Order.find({}).select('amount sellerId status createdAt');

        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((s, o) => s + (o.amount || 0), 0);
        const delivered = allOrders.filter(o => o.status === 'Delivered').length;
        const COMMISSION_RATE = 0.05;
        const totalCommission = Math.round(totalRevenue * COMMISSION_RATE);

        // Revenue by seller
        const revenueBySellerMap = {};
        allOrders.forEach(o => {
            if (o.sellerId) {
                if (!revenueBySellerMap[o.sellerId]) revenueBySellerMap[o.sellerId] = 0;
                revenueBySellerMap[o.sellerId] += o.amount || 0;
            }
        });
        const revenueBySeller = Object.entries(revenueBySellerMap)
            .map(([sellerId, revenue]) => ({ sellerId, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        // Monthly revenue (last 6 months)
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            const rev = allOrders
                .filter(o => o.createdAt >= start && o.createdAt <= end)
                .reduce((s, o) => s + (o.amount || 0), 0);
            monthlyRevenue.push({ month, revenue: rev });
        }

        return res.json({
            success: true,
            stats: {
                totalOrders,
                totalRevenue,
                delivered,
                totalCommission,
                revenueBySeller,
                monthlyRevenue
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
