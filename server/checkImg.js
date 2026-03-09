import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';

async function check() {
    await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
    const p = await Product.find({}, { name: 1, image: 1 }).limit(5);
    console.log(JSON.stringify(p, null, 2));
    process.exit(0);
}
check();
