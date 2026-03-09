import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';

async function check() {
    await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
    const p = await Product.findOne({ name: /Watermelon/i });
    if (p) {
        console.log('NAME:', p.name);
        console.log('IMAGE:', p.image);
    } else {
        console.log('Watermelon not found');
    }
    process.exit(0);
}
check();
