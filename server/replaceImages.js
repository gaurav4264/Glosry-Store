import fs from 'fs';
import path from 'path';

const seedFile = path.resolve('./seedProducts.js');
let content = fs.readFileSync(seedFile, 'utf8');

const imageDir = path.resolve('../client/public/images');
const images = fs.readdirSync(imageDir).filter(f => f.endsWith('.png'));

// Function to find the most relevant image
function findBestImage(name, category) {
    const lowerName = name.toLowerCase();

    // Exact word match attempt
    for (let img of images) {
        const imgBase = img.replace('_image', '').replace('.png', '').replace(/_[0-9]+$/, '').toLowerCase();
        if (lowerName.includes(imgBase) && imgBase.length > 2) {
            return `/images/${img}`;
        }
    }

    // Fallbacks based on category
    const catMap = {
        'Vegetables': 'organic_vegitable_image.png',
        'Fruits': 'fresh_fruits_image.png',
        'Dairy': 'dairy_product_image.png',
        'Drinks': 'bottles_image.png',
        'Instant': 'maggi_image.png',
        'Bakery': 'bakery_image.png',
        'Grains': 'grain_image.png',
        'Snacks': 'snacks_image.png',
        'Spices': 'spices_image.png',
        'Personal': 'personal_care_image.png',
        'Frozen': 'frozen_foods_image.png',
        'Sweets': 'sweets_mithai_image.png',
        'Tea': 'tea_coffee_image.png',
        'Oil': 'cooking_oil_image.png',
        'DryFruits': 'dry_fruits_image.png',
        'Juices': 'juices_image.png',
        'Baby': 'baby_products_image.png',
        'Cleaning': 'cleaning_products_image.png',
        'Meat': 'meat_seafood_image.png',
        'Condiments': 'condiments_image.png'
    };

    if (catMap[category]) {
        return `/images/${catMap[category]}`;
    }
    return '';
}

// Manually fix the specific products to exact matches or category images
const updatedContent = content.replace(/\{ name: '([^']+)', category: '([^']+)',[\s\S]*?image: u\('[^']+'\)(.*?)\}/g, (match, name, category, rest) => {
    let bestImg = findBestImage(name, category);

    // Exception cases
    if (name.includes('Coca-Cola')) bestImg = '/images/coca_cola_image.png';
    else if (name.includes('Pepsi')) bestImg = '/images/pepsi_image.png';
    else if (name.includes('Amul Milk')) bestImg = '/images/amul_milk_image.png';
    else if (name.includes('Paneer')) bestImg = '/images/paneer_image.png';
    // else just use what we have

    return match.replace(/u\('[^']+'\)/, `['${bestImg}']`);
});

fs.writeFileSync(seedFile, updatedContent, 'utf8');
console.log('Seed file successfully updated with static local images!');
