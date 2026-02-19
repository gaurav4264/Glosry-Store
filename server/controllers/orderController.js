import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe"
import User from "../models/User.js"
import Coupon from "../models/Coupon.js"
import { v2 as cloudinary } from 'cloudinary'

// Helper: Calculate membership tier
const calculateTier = (totalSpent) => {
    if (totalSpent >= 10000) return 'Gold';
    if (totalSpent >= 5000) return 'Silver';
    return 'Bronze';
};

// Helper: Award loyalty points to user
const awardLoyaltyPoints = async (userId, orderAmount) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;
        const pointsEarned = Math.floor(orderAmount / 10); // 1 point per ₹10
        user.loyaltyPoints += pointsEarned;
        user.totalSpent += orderAmount;
        user.membershipTier = calculateTier(user.totalSpent);
        await user.save();
    } catch (err) {
        console.log('Loyalty award error:', err.message);
    }
};

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, address, couponCode, couponDiscount } = req.body;
        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" })
        }
        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Apply coupon discount
        let discount = 0;
        if (couponCode && couponDiscount > 0) {
            discount = couponDiscount;
            amount -= discount;
            // Update coupon usage
            await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usedCount: 1 } });
        }

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
            couponCode: couponCode || null,
            discount,
        });

        // Clear user cart
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        // Award loyalty points
        await awardLoyaltyPoints(userId, amount);

        return res.json({ success: true, message: "Order Placed Successfully" })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Update Order Status : /api/order/status
export const updateStatus = async (req, res) => {
    try {
        const { orderId, status, date, time } = req.body;

        const updateData = { status };
        if (date) updateData.scheduledDeliveryDate = new Date(date);
        if (time) updateData.deliveryTimeSlot = time;

        // Push to statusHistory
        const pushData = { statusHistory: { status, timestamp: new Date() } };

        // If COD order is marked as Delivered, also mark it as Paid
        if (status === 'Delivered') {
            const order = await Order.findById(orderId);
            if (order && order.paymentType === 'COD') {
                updateData.isPaid = true;
            }
        }

        await Order.findByIdAndUpdate(orderId, { $set: updateData, $push: pushData });
        res.json({ success: true, message: 'Order Updated' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, address, couponCode, couponDiscount } = req.body;
        const { origin } = req.headers;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" })
        }

        let productData = [];

        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Apply coupon discount
        let discount = 0;
        if (couponCode && couponDiscount > 0) {
            discount = couponDiscount;
            amount -= discount;
            await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usedCount: 1 } });
        }

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
            couponCode: couponCode || null,
            discount,
        });

        // Stripe Gateway Initialize    
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // create line items for stripe
        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100
                },
                quantity: item.quantity,
            }
        })

        // Add discount as a negative line item if coupon applied
        if (discount > 0) {
            line_items.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Coupon Discount (${couponCode})`,
                    },
                    unit_amount: discount * 100 * -1
                },
                quantity: 1,
            });
        }

        // create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })

        return res.json({ success: true, url: session.url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Stripe Webhooks to Verify Payments Action : /stripe
export const stripeWebhooks = async (request, response) => {
    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        response.status(400).send(`Webhook Error: ${error.message}`)
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = session.data[0].metadata;
            // Mark Payment as Paid
            const order = await Order.findByIdAndUpdate(orderId, { isPaid: true }, { new: true });
            // Clear user cart
            await User.findByIdAndUpdate(userId, { cartItems: {} });
            // Award loyalty points for Stripe payments
            if (order) {
                await awardLoyaltyPoints(userId, order.amount);
            }
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId } = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }


        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }
    response.json({ received: true });
}


// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({
            userId,
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate({
            path: "items.product",
            populate: { path: "shopId", select: "name _id" }
        }).populate("address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// Get Seller Report Stats : /api/order/report
export const getSellerReport = async (req, res) => {
    try {
        const { startDate, endDate, groupBy, status } = req.query; // groupBy: 'month', 'week', 'year'; status: 'All', 'Pending', 'Delivered', 'Cancelled'

        // Date Filter
        let dateQuery = {};
        if (startDate && endDate) {
            dateQuery.createdAt = { // Changed to createdAt for consistency across all statuses
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        // Status Filter Logic
        let statusQuery = {};
        if (status && status !== 'All') {
            if (status === 'Pending') {
                statusQuery.status = { $in: ['Order Placed', 'Packing', 'Shipped', 'Out for Delivery'] };
            } else if (status === 'Delivered') {
                statusQuery.status = 'Delivered';
            } else if (status === 'Cancelled') {
                statusQuery.status = { $in: ['Cancelled', 'Returned', 'Return Requested'] };
            } else {
                statusQuery.status = status; // Specific status if needed
            }
        }

        // Combine Filters for Orders List
        const ordersQuery = { ...dateQuery, ...statusQuery };

        // 1. Fetch Filtered Orders List (Replaces "deliveredOrders")
        const orders = await Order.find(ordersQuery)
            .select('orderId amount createdAt updatedAt status items address')
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 });

        // 2. Pending Orders Count (Global or Filtered? Global context is usually better for "Pending" alerts, but lets keep specific pending list distinct)
        const pendingCount = await Order.countDocuments({
            status: { $in: ['Order Placed', 'Packing', 'Shipped', 'Out for Delivery'] }
        });

        // 3. Stats Aggregation (Revenue only counts Delivered)
        // We calculate stats based on Delivered orders in the selected DATE range, ignoring the status filter (so user always sees revenue stats even if they filter list by Pending)
        const deliveryDateQuery = {};
        if (startDate && endDate) {
            deliveryDateQuery.updatedAt = { // Revenue uses updatedAt (Delivery time)
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        // Group By Logic
        let groupId = {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" }
        };
        if (groupBy === 'week') {
            groupId = {
                year: { $year: "$updatedAt" },
                week: { $week: "$updatedAt" }
            };
        } else if (groupBy === 'year') {
            groupId = {
                year: { $year: "$updatedAt" }
            };
        }

        const stats = await Order.aggregate([
            {
                $match: {
                    status: 'Delivered',
                    updatedAt: { $ne: null },
                    ...(startDate && endDate ? {
                        updatedAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                        }
                    } : {})
                }
            },
            {
                $group: {
                    _id: groupId,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$amount" }
                }
            },
            { $sort: groupBy === 'week' ? { "_id.year": -1, "_id.week": -1 } : (groupBy === 'year' ? { "_id.year": -1 } : { "_id.year": -1, "_id.month": -1 }) }
        ]);

        // 4. Overall Status Breakdown (for the filtered period based on CreatedAt)
        // This answers: "Of the orders placed in this period, what is their status now?"
        const statusBreakdown = await Order.aggregate([
            {
                $match: {
                    ...(startDate && endDate ? {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                        }
                    } : {})
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format breakdown for easier frontend consumption
        const overview = {
            totalOrders: 0,
            delivered: 0,
            cancelled: 0,
            pending: 0,
            returned: 0
        };

        statusBreakdown.forEach(item => {
            overview.totalOrders += item.count;
            if (item._id === 'Delivered') overview.delivered += item.count;
            else if (item._id === 'Cancelled') overview.cancelled += item.count;
            else if (item._id === 'Returned' || item._id === 'Return Requested') overview.returned += item.count;
            else overview.pending += item.count; // All other statuses are "Pending" process
        });

        res.json({
            success: true,
            pendingCount,
            orders,
            stats,
            overview // Data for summary cards
        });

    } catch (error) {
        console.error("Report Error:", error);
        res.json({ success: false, message: error.message });
    }
}

// Get All Orders ( for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Cancel Order : /api/order/cancel
export const cancelOrder = async (req, res) => {
    try {
        const { userId, orderId, reason } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Verify order belongs to user
        if (order.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Only allow cancellation for 'Order Placed' and 'Packing'
        if (!['Order Placed', 'Packing'].includes(order.status)) {
            return res.json({ success: false, message: "Order cannot be cancelled at this stage" });
        }

        order.status = 'Cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = reason || 'No reason provided';
        order.statusHistory.push({ status: 'Cancelled', timestamp: new Date() });
        // Restore Stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stockQuantity: item.quantity },
                $set: { inStock: true } // Ensure it's marked in stock if it was sold out
            });
        }

        await order.save();

        return res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

import fs from 'fs';

// Return Order : /api/order/return
export const returnOrder = async (req, res) => {
    try {
        const logData = `
--------------------------------------------------
Time: ${new Date().toISOString()}
Headers: ${JSON.stringify(req.headers)}
Body: ${JSON.stringify(req.body)}
Files: ${req.files ? req.files.map(f => f.originalname).join(', ') : 'No files'}
--------------------------------------------------
`;
        fs.appendFileSync('request_debug.log', logData);

        const { userId, orderId, reason } = req.body;
        const imageFiles = req.files;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Verify order belongs to user
        if (order.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Only allow return for 'Delivered' orders
        if (order.status !== 'Delivered') {
            return res.json({ success: false, message: "Return is only available for delivered orders" });
        }

        // Check if within 7 days of delivery
        const deliveredDate = order.updatedAt;
        const daysSinceDelivery = (new Date() - new Date(deliveredDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceDelivery > 7) {
            return res.json({ success: false, message: "Return window (7 days) has expired" });
        }

        // Upload images to Cloudinary
        const returnImagesArr = [];
        if (imageFiles && imageFiles.length > 0) {
            for (const file of imageFiles) {
                const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
                returnImagesArr.push(result.secure_url);
            }
        }

        // Update Order
        order.status = 'Return Requested';
        order.returnStatus = 'Pending';
        order.returnReason = reason;
        order.returnImages = returnImagesArr;
        order.returnRequestedAt = new Date();
        order.statusHistory.push({ status: 'Return Requested', timestamp: new Date() });

        await order.save();

        return res.json({ success: true, message: "Return request submitted successfully" });
    } catch (error) {
        console.error("Return Order Error:", error);
        return res.json({ success: false, message: error.message });
    }
}
