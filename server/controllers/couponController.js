import Coupon from "../models/Coupon.js";

// Apply / Validate Coupon : POST /api/coupon/apply
export const applyCoupon = async (req, res) => {
    try {
        const { code, cartAmount } = req.body;

        if (!code) {
            return res.json({ success: false, message: "Please enter a coupon code" });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid coupon code" });
        }

        // Check expiry
        if (new Date() > new Date(coupon.expiryDate)) {
            return res.json({ success: false, message: "This coupon has expired" });
        }

        // Check usage limit
        if (coupon.usedCount >= coupon.usageLimit) {
            return res.json({ success: false, message: "This coupon has reached its usage limit" });
        }

        // Check minimum order amount
        if (cartAmount < coupon.minOrderAmount) {
            return res.json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
        }

        // Calculate discount
        let discount = Math.floor((cartAmount * coupon.discountPercent) / 100);
        if (discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }

        return res.json({
            success: true,
            message: `Coupon applied! You save ₹${discount}`,
            discount,
            couponCode: coupon.code,
            discountPercent: coupon.discountPercent
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Create Coupon (Seller/Admin) : POST /api/coupon/create
export const createCoupon = async (req, res) => {
    try {
        const { code, discountPercent, maxDiscount, minOrderAmount, expiryDate, usageLimit } = req.body;

        if (!code || !discountPercent || !expiryDate) {
            return res.json({ success: false, message: "Code, discount percent and expiry date are required" });
        }

        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.json({ success: false, message: "Coupon code already exists" });
        }

        await Coupon.create({
            code: code.toUpperCase(),
            discountPercent,
            maxDiscount: maxDiscount || 500,
            minOrderAmount: minOrderAmount || 0,
            expiryDate,
            usageLimit: usageLimit || 100
        });

        return res.json({ success: true, message: "Coupon created successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
