import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';

// LoremFlickr: always returns a real keyword-matched photo, guaranteed to load
const lf = (kw, lock) => [`https://loremflickr.com/400/400/${kw}?lock=${lock}`];

const products1 = [
    // ─── VEGETABLES ───
    { name: 'Potato 500g', category: 'Vegetables', price: 25, offerPrice: 20, image: lf('potato', 1), description: ['Farm fresh', 'Rich in carbs', 'For curries'], inStock: true },
    { name: 'Tomato 1kg', category: 'Vegetables', price: 40, offerPrice: 35, image: lf('tomato', 1), description: ['Juicy & ripe', 'Vitamin C rich', 'Farm fresh'], inStock: true },
    { name: 'Carrot 500g', category: 'Vegetables', price: 30, offerPrice: 28, image: lf('carrot', 1), description: ['Sweet & crunchy', 'Good for eyes', 'For salads'], inStock: true },
    { name: 'Spinach 500g', category: 'Vegetables', price: 18, offerPrice: 15, image: lf('spinach', 1), description: ['Iron rich', 'High vitamins', 'For soups'], inStock: true },
    { name: 'Onion 500g', category: 'Vegetables', price: 22, offerPrice: 19, image: lf('onion', 1), description: ['Fresh & pungent', 'For cooking', 'Kitchen staple'], inStock: true },
    { name: 'Cabbage 1kg', category: 'Vegetables', price: 35, offerPrice: 30, image: lf('cabbage', 1), description: ['Crisp & fresh', 'Low calories', 'For salads'], inStock: true },
    { name: 'Brinjal 500g', category: 'Vegetables', price: 28, offerPrice: 24, image: lf('eggplant', 1), description: ['Tender & tasty', 'Antioxidants', 'For curries'], inStock: true },
    { name: 'Cauliflower 1pc', category: 'Vegetables', price: 45, offerPrice: 40, image: lf('cauliflower', 1), description: ['Fresh & white', 'Low carb', 'For sabzi'], inStock: true },
    { name: 'Capsicum 250g', category: 'Vegetables', price: 30, offerPrice: 26, image: lf('bell,pepper', 1), description: ['Colorful & crunchy', 'Vitamin C', 'Stir fry'], inStock: true },
    { name: 'Cucumber 500g', category: 'Vegetables', price: 20, offerPrice: 17, image: lf('cucumber', 1), description: ['Cool & hydrating', 'For salads', 'Low calories'], inStock: true },

    // ─── FRUITS ───
    { name: 'Apple 1kg', category: 'Fruits', price: 120, offerPrice: 110, image: lf('apple', 1), description: ['Crisp & juicy', 'Fiber rich', 'Boosts immunity'], inStock: true },
    { name: 'Orange 1kg', category: 'Fruits', price: 80, offerPrice: 75, image: lf('orange,fruit', 1), description: ['Juicy & sweet', 'Vitamin C', 'For juices'], inStock: true },
    { name: 'Banana 1kg', category: 'Fruits', price: 50, offerPrice: 45, image: lf('banana', 1), description: ['Sweet & ripe', 'High potassium', 'For smoothies'], inStock: true },
    { name: 'Mango 1kg', category: 'Fruits', price: 150, offerPrice: 140, image: lf('mango', 1), description: ['Sweet & flavourful', 'Vitamin A', 'King of fruits'], inStock: true },
    { name: 'Grapes 500g', category: 'Fruits', price: 70, offerPrice: 65, image: lf('grapes', 1), description: ['Fresh & juicy', 'Antioxidants', 'For snacking'], inStock: true },
    { name: 'Watermelon 1pc', category: 'Fruits', price: 80, offerPrice: 70, image: lf('watermelon', 1), description: ['Juicy & sweet', 'Stay hydrated', 'Summer fav'], inStock: true },
    { name: 'Papaya 1kg', category: 'Fruits', price: 60, offerPrice: 55, image: lf('papaya', 1), description: ['Soft & sweet', 'Papain rich', 'Good digestion'], inStock: true },
    { name: 'Pineapple 1pc', category: 'Fruits', price: 90, offerPrice: 80, image: lf('pineapple', 1), description: ['Tangy & sweet', 'Bromelain rich', 'For juices'], inStock: true },
    { name: 'Guava 500g', category: 'Fruits', price: 40, offerPrice: 35, image: lf('guava', 1), description: ['Sweet & crunchy', 'Vitamin C', 'Healthy snack'], inStock: true },
    { name: 'Pomegranate 1kg', category: 'Fruits', price: 140, offerPrice: 130, image: lf('pomegranate', 1), description: ['Antioxidant rich', 'Immunity boost', 'Ruby seeds'], inStock: true },

    // ─── DAIRY ───
    { name: 'Amul Milk 1L', category: 'Dairy', price: 60, offerPrice: 55, image: lf('milk,bottle', 1), description: ['Pure & fresh', 'Calcium rich', 'Trusted brand'], inStock: true },
    { name: 'Paneer 200g', category: 'Dairy', price: 90, offerPrice: 85, image: lf('cottage,cheese', 1), description: ['Soft & fresh', 'Protein rich', 'For curries'], inStock: true },
    { name: 'Eggs 12pcs', category: 'Dairy', price: 90, offerPrice: 85, image: lf('eggs', 1), description: ['Farm fresh', 'Protein rich', 'For breakfast'], inStock: true },
    { name: 'Cheese 200g', category: 'Dairy', price: 140, offerPrice: 130, image: lf('cheese', 1), description: ['Creamy & rich', 'For pizzas', 'Calcium rich'], inStock: true },
    { name: 'Curd 400g', category: 'Dairy', price: 45, offerPrice: 40, image: lf('yogurt', 1), description: ['Thick & creamy', 'Probiotic rich', 'Great with meals'], inStock: true },
    { name: 'Butter 100g', category: 'Dairy', price: 55, offerPrice: 50, image: lf('butter', 1), description: ['Rich & creamy', 'Pure cow milk', 'For toast'], inStock: true },
    { name: 'Ghee 500ml', category: 'Dairy', price: 350, offerPrice: 320, image: lf('ghee,jar', 1), description: ['Pure desi ghee', 'Rich aroma', 'Traditional'], inStock: true },
    { name: 'Buttermilk 500ml', category: 'Dairy', price: 25, offerPrice: 22, image: lf('glass,milk', 1), description: ['Cool & refreshing', 'Good digestion', 'Low fat'], inStock: true },
    { name: 'Condensed Milk 400g', category: 'Dairy', price: 95, offerPrice: 88, image: lf('condensed,milk', 1), description: ['Sweet & creamy', 'For desserts', 'Rich taste'], inStock: true },
    { name: 'Yogurt 200g', category: 'Dairy', price: 40, offerPrice: 36, image: lf('yogurt,bowl', 1), description: ['Smooth & creamy', 'Probiotic rich', 'Daily health'], inStock: true },

    // ─── DRINKS ───
    { name: 'Coca-Cola 1.5L', category: 'Drinks', price: 80, offerPrice: 75, image: lf('cola,drink', 1), description: ['Refreshing fizzy', 'Best chilled', 'Party fav'], inStock: true },
    { name: 'Pepsi 1.5L', category: 'Drinks', price: 78, offerPrice: 73, image: lf('pepsi,cola', 1), description: ['Chilled refreshing', 'Celebrations', 'Best cold'], inStock: true },
    { name: 'Sprite 1.5L', category: 'Drinks', price: 79, offerPrice: 74, image: lf('soda,lemon', 1), description: ['Citrus taste', 'Hot day drink', 'Best chilled'], inStock: true },
    { name: 'Fanta 1.5L', category: 'Drinks', price: 77, offerPrice: 72, image: lf('orange,soda', 1), description: ['Sweet & fizzy', 'For parties', 'Best cold'], inStock: true },
    { name: '7 Up 1.5L', category: 'Drinks', price: 76, offerPrice: 71, image: lf('lemon,drink', 1), description: ['Lemon lime fizz', 'Refreshing', 'Best chilled'], inStock: true },
    { name: 'Limca 600ml', category: 'Drinks', price: 40, offerPrice: 36, image: lf('lemon,soda', 1), description: ['Tangy lemon', 'Refreshing fizzy', 'Cool crisp'], inStock: true },
    { name: 'Thums Up 1.5L', category: 'Drinks', price: 78, offerPrice: 73, image: lf('cola,bottle', 1), description: ['Bold strong cola', 'Party drink', 'Chilled best'], inStock: true },
    { name: 'Maaza Mango 600ml', category: 'Drinks', price: 40, offerPrice: 36, image: lf('mango,juice', 1), description: ['Mango nectar', 'Thick & fruity', 'Kids fav'], inStock: true },
    { name: 'Appy Fizz 500ml', category: 'Drinks', price: 45, offerPrice: 40, image: lf('apple,juice', 1), description: ['Apple fizz', 'Unique drink', 'Best chilled'], inStock: true },
    { name: 'Mountain Dew 1.5L', category: 'Drinks', price: 78, offerPrice: 72, image: lf('green,soda', 1), description: ['Citrus burst', 'Bold refreshing', 'Gamer fav'], inStock: true },

    // ─── INSTANT FOOD ───
    { name: 'Maggi Noodles 280g', category: 'Instant', price: 55, offerPrice: 50, image: lf('noodles', 1), description: ['Instant & easy', 'Delicious taste', 'Kids favourite'], inStock: true },
    { name: 'Top Ramen 270g', category: 'Instant', price: 45, offerPrice: 40, image: lf('ramen', 1), description: ['Quick to prepare', 'Spicy flavour', 'College fav'], inStock: true },
    { name: 'Knorr Cup Soup 70g', category: 'Instant', price: 35, offerPrice: 30, image: lf('soup,cup', 1), description: ['Warm & hearty', 'Healthy soup', 'Many flavours'], inStock: true },
    { name: 'Yippee Noodles 260g', category: 'Instant', price: 50, offerPrice: 45, image: lf('instant,noodles', 1), description: ['Non-fried', 'Tasty & filling', 'Convenient'], inStock: true },
    { name: 'Oats Noodles 72g', category: 'Instant', price: 40, offerPrice: 35, image: lf('oats,bowl', 1), description: ['Healthy oats', 'Good digestion', 'Light breakfast'], inStock: true },
    { name: 'Haldiram Dal Makhani 300g', category: 'Instant', price: 80, offerPrice: 72, image: lf('indian,curry', 1), description: ['Ready to eat', 'Restaurant taste', 'Heat & serve'], inStock: true },
    { name: 'MTR Poha 200g', category: 'Instant', price: 40, offerPrice: 36, image: lf('indian,breakfast', 1), description: ['Ready in 5 min', 'Traditional recipe', 'Light breakfast'], inStock: true },
    { name: 'Sunfeast Pasta 65g', category: 'Instant', price: 30, offerPrice: 26, image: lf('pasta', 1), description: ['Easy cook', 'Cheesy goodness', 'Kid fav'], inStock: true },
    { name: 'Upma Mix 200g', category: 'Instant', price: 35, offerPrice: 30, image: lf('semolina,food', 1), description: ['Ready to cook', 'Traditional taste', 'Light healthy'], inStock: true },
    { name: 'Hakka Noodles 150g', category: 'Instant', price: 45, offerPrice: 40, image: lf('chow,mein', 1), description: ['Indo-Chinese style', 'Stir-fry noodles', 'Restaurant taste'], inStock: true },

    // ─── BAKERY ───
    { name: 'Brown Bread 400g', category: 'Bakery', price: 40, offerPrice: 35, image: lf('bread,loaf', 1), description: ['Soft & healthy', 'Whole wheat', 'For breakfast'], inStock: true },
    { name: 'Butter Croissant 100g', category: 'Bakery', price: 50, offerPrice: 45, image: lf('croissant', 1), description: ['Flaky & buttery', 'Freshly baked', 'For breakfast'], inStock: true },
    { name: 'Chocolate Cake 500g', category: 'Bakery', price: 350, offerPrice: 325, image: lf('chocolate,cake', 1), description: ['Rich & moist', 'Premium cocoa', 'Celebrations'], inStock: true },
    { name: 'Whole Wheat Bread 400g', category: 'Bakery', price: 45, offerPrice: 40, image: lf('wheat,bread', 1), description: ['Healthy', 'Whole wheat flour', 'For sandwiches'], inStock: true },
    { name: 'Vanilla Muffins 6pcs', category: 'Bakery', price: 100, offerPrice: 90, image: lf('muffin', 1), description: ['Soft & fluffy', 'Quick snack', 'Real vanilla'], inStock: true },
    { name: 'Pav Bun 6pcs', category: 'Bakery', price: 30, offerPrice: 26, image: lf('buns,bread', 1), description: ['Soft & fresh', 'For pav bhaji', 'Bakery fresh'], inStock: true },
    { name: 'Fruit Cake 400g', category: 'Bakery', price: 180, offerPrice: 165, image: lf('fruit,cake', 1), description: ['Dryfruit mix', 'Moist & flavourful', 'Festive pick'], inStock: true },
    { name: 'Assorted Cookies 200g', category: 'Bakery', price: 80, offerPrice: 72, image: lf('cookies', 1), description: ['Crunchy & sweet', 'Assorted flavours', 'With tea'], inStock: true },
    { name: 'Pita Bread 4pcs', category: 'Bakery', price: 90, offerPrice: 82, image: lf('pita,bread', 1), description: ['Soft flatbread', 'For wraps', 'Oven fresh'], inStock: true },
    { name: 'Rusk 200g', category: 'Bakery', price: 35, offerPrice: 30, image: lf('biscuit,rusk', 1), description: ['Crunchy & sweet', 'With chai', 'Long shelf life'], inStock: true },

    // ─── GRAINS ───
    { name: 'Basmati Rice 5kg', category: 'Grains', price: 550, offerPrice: 520, image: lf('basmati,rice', 1), description: ['Long grain aromatic', 'For biryani', 'Premium quality'], inStock: true },
    { name: 'Wheat Flour 5kg', category: 'Grains', price: 250, offerPrice: 230, image: lf('flour,wheat', 1), description: ['Quality wheat', 'Fluffy rotis', 'Nutrient rich'], inStock: true },
    { name: 'Quinoa 500g', category: 'Grains', price: 450, offerPrice: 420, image: lf('quinoa', 1), description: ['High protein', 'Gluten free', 'Vitamin rich'], inStock: true },
    { name: 'Brown Rice 1kg', category: 'Grains', price: 120, offerPrice: 110, image: lf('brown,rice', 1), description: ['Whole grain', 'Weight management', 'Magnesium rich'], inStock: true },
    { name: 'Barley 1kg', category: 'Grains', price: 150, offerPrice: 140, image: lf('barley,grain', 1), description: ['Fiber rich', 'Good digestion', 'Low fat'], inStock: true },
    { name: 'Oats 1kg', category: 'Grains', price: 180, offerPrice: 165, image: lf('oatmeal', 1), description: ['Heart healthy', 'Beta-glucan rich', 'Filling breakfast'], inStock: true },
    { name: 'Sona Masoori Rice 5kg', category: 'Grains', price: 400, offerPrice: 375, image: lf('rice,grains', 1), description: ['Light & fluffy', 'Low starch', 'South Indian fav'], inStock: true },
    { name: 'Moong Dal 1kg', category: 'Grains', price: 130, offerPrice: 120, image: lf('lentils', 1), description: ['High protein', 'Easy to digest', 'Nutritious'], inStock: true },
    { name: 'Chana Dal 1kg', category: 'Grains', price: 110, offerPrice: 100, image: lf('chickpea', 1), description: ['Protein rich', 'Nutty flavour', 'Versatile dal'], inStock: true },
    { name: 'Toor Dal 1kg', category: 'Grains', price: 145, offerPrice: 135, image: lf('dal,lentil', 1), description: ['Staple lentil', 'Dal tadka essential', 'Protein rich'], inStock: true },

    // ─── SNACKS ───
    { name: 'Lays Classic 75g', category: 'Snacks', price: 30, offerPrice: 25, image: lf('potato,chips', 1), description: ['Crispy chips', 'Classic salted', 'Party snack'], inStock: true },
    { name: 'Kurkure Masala 90g', category: 'Snacks', price: 25, offerPrice: 20, image: lf('snack,crunchy', 1), description: ['Crunchy & spicy', 'Tangy masala', 'Evening snack'], inStock: true },
    { name: 'Bingo Mad Angles 90g', category: 'Snacks', price: 20, offerPrice: 18, image: lf('corn,snack', 1), description: ['Unique shape', 'Bold spicy', 'Fun to munch'], inStock: true },
    { name: 'Pringles Original 107g', category: 'Snacks', price: 160, offerPrice: 148, image: lf('chips,can', 1), description: ['Stacked chips', 'Original salted', 'Premium snack'], inStock: true },
    { name: 'Haldiram Bhujia 200g', category: 'Snacks', price: 80, offerPrice: 72, image: lf('namkeen,snack', 1), description: ['Crispy & spicy', 'Traditional namkeen', 'Tea time'], inStock: true },
    { name: 'Too Yumm 70g', category: 'Snacks', price: 25, offerPrice: 22, image: lf('baked,snack', 1), description: ['Baked not fried', 'Multigrain', 'Guilt free'], inStock: true },
    { name: 'Cornitos Nachos 150g', category: 'Snacks', price: 90, offerPrice: 82, image: lf('nachos', 1), description: ['Crunchy nachos', 'With salsa dip', 'Party fav'], inStock: true },
    { name: 'Parle G 400g', category: 'Snacks', price: 35, offerPrice: 30, image: lf('biscuits', 1), description: ['Glucose biscuit', 'With tea', 'Classic taste'], inStock: true },
    { name: 'Oreo 300g', category: 'Snacks', price: 75, offerPrice: 68, image: lf('oreo,cookie', 1), description: ['Cream cookies', 'Chocolate sandwich', 'Twist lick'], inStock: true },
    { name: 'Butter Popcorn 100g', category: 'Snacks', price: 50, offerPrice: 45, image: lf('popcorn', 1), description: ['Ready to eat', 'Buttery flavour', 'Movie snack'], inStock: true },
];

async function seed1() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
        console.log('Connected to MongoDB');
        await Product.deleteMany({});
        console.log('Cleared existing products');
        await Product.insertMany(products1);
        console.log(`Part 1 done: ${products1.length} products`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}
seed1();
