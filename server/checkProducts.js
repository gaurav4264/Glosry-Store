import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';

async function check() {
    await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
    const total = await Product.countDocuments();
    console.log(`Total products in DB: ${total}`);
    const cats = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);
    cats.forEach(c => console.log(`  ${c._id}: ${c.count} products`));
    process.exit(0);
}
check();
