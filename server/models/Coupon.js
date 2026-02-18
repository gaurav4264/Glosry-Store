import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    maxDiscount: { type: Number, default: 500 },
    minOrderAmount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
}, { timestamps: true })

const Coupon = mongoose.models.coupon || mongoose.model('coupon', couponSchema)

export default Coupon
