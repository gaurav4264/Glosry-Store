import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'user' },
    items: [{
        product: { type: String, required: true, ref: 'product' },
        quantity: { type: Number, required: true }
    }],
    amount: { type: Number, required: true },
    address: { type: String, required: true, ref: 'address' },
    status: { type: String, default: 'Order Placed', enum: ['Order Placed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'] },
    paymentType: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    couponCode: { type: String, default: null },
    discount: { type: Number, default: 0 },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
    returnRequestedAt: { type: Date, default: null },
    returnReason: { type: String, default: null },
    returnImages: { type: [String], default: [] },
    returnStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed'], default: null },
    scheduledDeliveryDate: { type: Date, default: null },
    deliveryTimeSlot: { type: String, enum: ['Morning (9AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-8PM)'], default: null },
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly'], default: null },
    deliveryAgent: {
        name: { type: String, default: null },
        phone: { type: String, default: null },
        estimatedTime: { type: Date, default: null }
    },
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now }
    }],
    sellerId: { type: String, default: null },   // Vendor's sellerId who fulfills this order
    trackingId: { type: String, default: null }, // Auto-generated when shipped
    vendorStatus: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Packed', 'Shipped', 'Delivered'],
        default: 'Pending'
    },
}, { timestamps: true })

const Order = mongoose.models.order || mongoose.model('order', orderSchema)

export default Order