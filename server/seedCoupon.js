import mongoose from 'mongoose';
import 'dotenv/config';
import Coupon from './models/Coupon.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('DB connected');

// Create multiple useful coupons
const coupons = [
    {
        code: 'SAVE10',
        discountPercent: 10,
        maxDiscount: 100,
        minOrderAmount: 99,
        expiryDate: new Date('2027-12-31'),
        usageLimit: 1000,
        isActive: true
    },
    {
        code: 'WELCOME20',
        discountPercent: 20,
        maxDiscount: 200,
        minOrderAmount: 199,
        expiryDate: new Date('2027-12-31'),
        usageLimit: 500,
        isActive: true
    },
    {
        code: 'FLAT50',
        discountPercent: 50,
        maxDiscount: 50,
        minOrderAmount: 0,
        expiryDate: new Date('2027-12-31'),
        usageLimit: 200,
        isActive: true
    }
];

for (const c of coupons) {
    try {
        await Coupon.findOneAndUpdate(
            { code: c.code },
            c,
            { upsert: true, new: true }
        );
        console.log(`✅ Coupon ${c.code} created/updated`);
    } catch (e) {
        console.log(`❌ ${c.code}:`, e.message);
    }
}

console.log('Done!');
process.exit(0);
