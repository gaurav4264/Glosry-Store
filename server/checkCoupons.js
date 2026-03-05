import mongoose from 'mongoose';
import 'dotenv/config';
import Coupon from './models/Coupon.js';

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const coupons = await Coupon.find({});
    console.log("Found coupons:", coupons);
    process.exit(0);
}
run();
