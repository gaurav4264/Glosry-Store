import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';

async function fixBug() {
    await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
    const products = await Product.find({});

    // Fallbacks based on category (GUARANTEED safe default per category)
    const catMap = {
        'Vegetables': '/images/organic_vegitable_image.png',
        'Fruits': '/images/fresh_fruits_image.png',
        'Dairy': '/images/dairy_product_image.png',
        'Drinks': '/images/bottles_image.png',
        'Instant': '/images/maggi_image.png',
        'Bakery': '/images/bakery_image.png',
        'Grains': '/images/grain_image.png',
        'Snacks': '/images/snacks_image.png',
        'Spices': '/images/spices_image.png',
        'Personal': '/images/personal_care_image.png',
        'Frozen': '/images/frozen_foods_image.png',
        'Sweets': '/images/sweets_mithai_image.png',
        'Tea': '/images/tea_coffee_image.png',
        'Oil': '/images/cooking_oil_image.png',
        'DryFruits': '/images/dry_fruits_image.png',
        'Juices': '/images/juices_image.png',
        'Baby': '/images/baby_products_image.png',
        'Cleaning': '/images/cleaning_products_image.png',
        'Meat': '/images/meat_seafood_image.png',
        'Condiments': '/images/condiments_image.png'
    };

    // EXACT known images for specific product base names
    const exactMatchMap = {
        'potato': '/images/potato_image_1.png',
        'tomato': '/images/tomato_image.png',
        'carrot': '/images/carrot_image.png',
        'spinach': '/images/spinach_image_1.png',
        'onion': '/images/onion_image_1.png',
        'apple': '/images/apple_image.png',
        'orange': '/images/orange_image.png',
        'banana': '/images/banana_image_1.png',
        'mango': '/images/mango_image_1.png',
        'grapes': '/images/grapes_image_1.png',

        'amul milk': '/images/amul_milk_image.png',
        'coca-cola': '/images/coca_cola_image.png',
        'brown bread': '/images/brown_bread_image.png',
        'basmati': '/images/basmati_rice_image.png',
        'paneer': '/images/paneer_image.png',
        'pepsi': '/images/pepsi_image.png',
        'wheat flour': '/images/wheat_flour_image.png',
        'cheese': '/images/cheese_image.png',
        'eggs': '/images/eggs_image.png',

        'sprite': '/images/sprite_image_1.png',
        'fanta': '/images/fanta_image_1.png',
        '7 up': '/images/seven_up_image_1.png',
        'top ramen': '/images/top_ramen_image.png',
        'knorr': '/images/knorr_soup_image.png',
        'yippee': '/images/yippee_image.png',

        'butter croissant': '/images/butter_croissant_image.png',
        'chocolate cake': '/images/chocolate_cake_image.png',
        'whole wheat bread': '/images/whole_wheat_bread_image.png',
        'vanilla muffins': '/images/vanilla_muffins_image.png',
        'quinoa': '/images/quinoa_image.png',
        'brown rice': '/images/brown_rice_image.png',
        'barley': '/images/barley_image.png',
    };

    let count = 0;
    for (let p of products) {
        let bestImg = catMap[p.category] || '/images/box_icon.svg';

        const lowerName = p.name.toLowerCase();

        // Exact word match to avoid "pineapple" matching "apple"
        for (const [key, value] of Object.entries(exactMatchMap)) {
            // Create a regex for whole word match
            const regex = new RegExp(`\\b${key}\\b`, 'i');
            if (regex.test(lowerName)) {
                bestImg = value;
                break;
            }
        }

        // Apply the fix
        p.image = [bestImg];
        await p.save();
        count++;
    }

    console.log(`Word boundary fix applied to ${count} products.`);
    process.exit(0);
}

fixBug();
