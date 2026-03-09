import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';

// Helper: generate Unsplash URL
const u = (id) => [`https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&auto=format`];

const products = [
    // ─── VEGETABLES ───
    { name: 'Potato 500g', category: 'Vegetables', price: 25, offerPrice: 20, image: ['/images/potato_image_1.png'], description: ['Farm fresh', 'Rich in carbs', 'For curries'], inStock: true },
    { name: 'Tomato 1kg', category: 'Vegetables', price: 40, offerPrice: 35, image: ['/images/tomato_image.png'], description: ['Juicy & ripe', 'Vitamin C rich', 'Farm fresh'], inStock: true },
    { name: 'Carrot 500g', category: 'Vegetables', price: 30, offerPrice: 28, image: ['/images/carrot_image.png'], description: ['Sweet & crunchy', 'Good for eyes', 'For salads'], inStock: true },
    { name: 'Spinach 500g', category: 'Vegetables', price: 18, offerPrice: 15, image: ['/images/spinach_image_1.png'], description: ['Iron rich', 'High vitamins', 'For soups'], inStock: true },
    { name: 'Onion 500g', category: 'Vegetables', price: 22, offerPrice: 19, image: ['/images/onion_image_1.png'], description: ['Fresh & pungent', 'For cooking', 'Kitchen staple'], inStock: true },
    { name: 'Cabbage 1kg', category: 'Vegetables', price: 35, offerPrice: 30, image: ['/images/organic_vegitable_image.png'], description: ['Crisp & fresh', 'Low calories', 'For salads'], inStock: true },
    { name: 'Brinjal 500g', category: 'Vegetables', price: 28, offerPrice: 24, image: ['/images/organic_vegitable_image.png'], description: ['Tender & tasty', 'Antioxidants', 'For curries'], inStock: true },
    { name: 'Cauliflower 1pc', category: 'Vegetables', price: 45, offerPrice: 40, image: ['/images/organic_vegitable_image.png'], description: ['Fresh & white', 'Low carb', 'For sabzi'], inStock: true },
    { name: 'Capsicum 250g', category: 'Vegetables', price: 30, offerPrice: 26, image: ['/images/organic_vegitable_image.png'], description: ['Colorful & crunchy', 'Vitamin C', 'Stir fry'], inStock: true },
    { name: 'Cucumber 500g', category: 'Vegetables', price: 20, offerPrice: 17, image: ['/images/organic_vegitable_image.png'], description: ['Cool & hydrating', 'For salads', 'Low calories'], inStock: true },

    // ─── FRUITS ───
    { name: 'Apple 1kg', category: 'Fruits', price: 120, offerPrice: 110, image: ['/images/apple_image.png'], description: ['Crisp & juicy', 'Fiber rich', 'Boosts immunity'], inStock: true },
    { name: 'Orange 1kg', category: 'Fruits', price: 80, offerPrice: 75, image: ['/images/orange_image.png'], description: ['Juicy & sweet', 'Vitamin C', 'For juices'], inStock: true },
    { name: 'Banana 1kg', category: 'Fruits', price: 50, offerPrice: 45, image: ['/images/banana_image_1.png'], description: ['Sweet & ripe', 'High potassium', 'For smoothies'], inStock: true },
    { name: 'Mango 1kg', category: 'Fruits', price: 150, offerPrice: 140, image: ['/images/mango_image_1.png'], description: ['Sweet & flavourful', 'Vitamin A', 'King of fruits'], inStock: true },
    { name: 'Grapes 500g', category: 'Fruits', price: 70, offerPrice: 65, image: ['/images/grapes_image_1.png'], description: ['Fresh & juicy', 'Antioxidants', 'For snacking'], inStock: true },
    { name: 'Watermelon 1pc', category: 'Fruits', price: 80, offerPrice: 70, image: ['/images/fresh_fruits_image.png'], description: ['Juicy & sweet', 'Stay hydrated', 'Summer fav'], inStock: true },
    { name: 'Papaya 1kg', category: 'Fruits', price: 60, offerPrice: 55, image: ['/images/fresh_fruits_image.png'], description: ['Soft & sweet', 'Papain rich', 'Good digestion'], inStock: true },
    { name: 'Pineapple 1pc', category: 'Fruits', price: 90, offerPrice: 80, image: ['/images/apple_image.png'], description: ['Tangy & sweet', 'Bromelain rich', 'For juices'], inStock: true },
    { name: 'Guava 500g', category: 'Fruits', price: 40, offerPrice: 35, image: ['/images/fresh_fruits_image.png'], description: ['Sweet & crunchy', 'Vitamin C', 'Healthy snack'], inStock: true },
    { name: 'Pomegranate 1kg', category: 'Fruits', price: 140, offerPrice: 130, image: ['/images/fresh_fruits_image.png'], description: ['Antioxidant rich', 'Immunity boost', 'Ruby seeds'], inStock: true },

    // ─── DAIRY ───
    { name: 'Amul Milk 1L', category: 'Dairy', price: 60, offerPrice: 55, image: ['/images/amul_milk_image.png'], description: ['Pure & fresh', 'Calcium rich', 'Trusted brand'], inStock: true },
    { name: 'Paneer 200g', category: 'Dairy', price: 90, offerPrice: 85, image: ['/images/paneer_image.png'], description: ['Soft & fresh', 'Protein rich', 'For curries'], inStock: true },
    { name: 'Eggs 12pcs', category: 'Dairy', price: 90, offerPrice: 85, image: ['/images/eggs_image.png'], description: ['Farm fresh', 'Protein rich', 'For breakfast'], inStock: true },
    { name: 'Cheese 200g', category: 'Dairy', price: 140, offerPrice: 130, image: ['/images/cheese_image.png'], description: ['Creamy & rich', 'For pizzas', 'Calcium rich'], inStock: true },
    { name: 'Curd 400g', category: 'Dairy', price: 45, offerPrice: 40, image: ['/images/dairy_product_image.png'], description: ['Thick & creamy', 'Probiotic rich', 'Great with meals'], inStock: true },
    { name: 'Butter 100g', category: 'Dairy', price: 55, offerPrice: 50, image: ['/images/dairy_product_image.png'], description: ['Rich & creamy', 'Pure cow milk', 'For toast'], inStock: true },
    { name: 'Ghee 500ml', category: 'Dairy', price: 350, offerPrice: 320, image: ['/images/dairy_product_image.png'], description: ['Pure desi ghee', 'Rich aroma', 'Traditional'], inStock: true },
    { name: 'Buttermilk 500ml', category: 'Dairy', price: 25, offerPrice: 22, image: ['/images/dairy_product_image.png'], description: ['Cool & refreshing', 'Good digestion', 'Low fat'], inStock: true },
    { name: 'Condensed Milk 400g', category: 'Dairy', price: 95, offerPrice: 88, image: ['/images/dairy_product_image.png'], description: ['Sweet & creamy', 'For desserts', 'Rich taste'], inStock: true },
    { name: 'Yogurt 200g', category: 'Dairy', price: 40, offerPrice: 36, image: ['/images/yogurt_image_1.png'], description: ['Smooth & creamy', 'Probiotic rich', 'Daily health'], inStock: true },

    // ─── DRINKS ───
    { name: 'Coca-Cola 1.5L', category: 'Drinks', price: 80, offerPrice: 75, image: ['/images/coca_cola_image.png'], description: ['Refreshing fizzy', 'Best chilled', 'Party fav'], inStock: true },
    { name: 'Pepsi 1.5L', category: 'Drinks', price: 78, offerPrice: 73, image: ['/images/pepsi_image.png'], description: ['Chilled refreshing', 'Celebrations', 'Best cold'], inStock: true },
    { name: 'Sprite 1.5L', category: 'Drinks', price: 79, offerPrice: 74, image: ['/images/sprite_image_1.png'], description: ['Citrus taste', 'Hot day drink', 'Best chilled'], inStock: true },
    { name: 'Fanta 1.5L', category: 'Drinks', price: 77, offerPrice: 72, image: ['/images/fanta_image_1.png'], description: ['Sweet & fizzy', 'For parties', 'Best cold'], inStock: true },
    { name: '7 Up 1.5L', category: 'Drinks', price: 76, offerPrice: 71, image: ['/images/bottles_image.png'], description: ['Lemon lime fizz', 'Refreshing', 'Best chilled'], inStock: true },
    { name: 'Limca 600ml', category: 'Drinks', price: 40, offerPrice: 36, image: ['/images/bottles_image.png'], description: ['Tangy lemon', 'Refreshing fizzy', 'Cool crisp'], inStock: true },
    { name: 'Thums Up 1.5L', category: 'Drinks', price: 78, offerPrice: 73, image: ['/images/bottles_image.png'], description: ['Bold strong cola', 'Party drink', 'Chilled best'], inStock: true },
    { name: 'Maaza Mango 600ml', category: 'Drinks', price: 40, offerPrice: 36, image: ['/images/mango_image_1.png'], description: ['Mango nectar', 'Thick & fruity', 'Kids fav'], inStock: true },
    { name: 'Appy Fizz 500ml', category: 'Drinks', price: 45, offerPrice: 40, image: ['/images/bottles_image.png'], description: ['Apple fizz', 'Unique drink', 'Best chilled'], inStock: true },
    { name: 'Mountain Dew 1.5L', category: 'Drinks', price: 78, offerPrice: 72, image: ['/images/bottles_image.png'], description: ['Citrus burst', 'Bold refreshing', 'Gamer fav'], inStock: true },

    // ─── INSTANT FOOD ───
    { name: 'Maggi Noodles 280g', category: 'Instant', price: 55, offerPrice: 50, image: ['/images/maggi_image.png'], description: ['Instant & easy', 'Delicious taste', 'Popular'], inStock: true },
    { name: 'Top Ramen 270g', category: 'Instant', price: 45, offerPrice: 40, image: ['/images/maggi_image.png'], description: ['Quick to prepare', 'Spicy flavour', 'College fav'], inStock: true },
    { name: 'Knorr Cup Soup 70g', category: 'Instant', price: 35, offerPrice: 30, image: ['/images/maggi_image.png'], description: ['Convenient', 'Healthy soup', 'Many flavours'], inStock: true },
    { name: 'Yippee Noodles 260g', category: 'Instant', price: 50, offerPrice: 45, image: ['/images/yippee_image.png'], description: ['Non-fried', 'Tasty & filling', 'Convenient'], inStock: true },
    { name: 'Oats Noodles 72g', category: 'Instant', price: 40, offerPrice: 35, image: ['/images/maggi_image.png'], description: ['Healthy oats', 'Good digestion', 'Light breakfast'], inStock: true },
    { name: 'Haldiram Dal Makhani 300g', category: 'Instant', price: 80, offerPrice: 72, image: ['/images/maggi_image.png'], description: ['Ready to eat', 'Restaurant taste', 'Heat & serve'], inStock: true },
    { name: 'MTR Poha 200g', category: 'Instant', price: 40, offerPrice: 36, image: ['/images/maggi_image.png'], description: ['Ready in 5 min', 'Traditional recipe', 'Light breakfast'], inStock: true },
    { name: 'Sunfeast Pasta 65g', category: 'Instant', price: 30, offerPrice: 26, image: ['/images/maggi_image.png'], description: ['Easy cook', 'Cheesy goodness', 'Kid fav'], inStock: true },
    { name: 'Upma Mix 200g', category: 'Instant', price: 35, offerPrice: 30, image: ['/images/maggi_image.png'], description: ['Ready to cook', 'Traditional taste', 'Light healthy'], inStock: true },
    { name: 'Hakka Noodles 150g', category: 'Instant', price: 45, offerPrice: 40, image: ['/images/maggi_image.png'], description: ['Indo-Chinese style', 'Stir-fry noodles', 'Restaurant taste'], inStock: true },

    // ─── BAKERY ───
    { name: 'Brown Bread 400g', category: 'Bakery', price: 40, offerPrice: 35, image: ['/images/bakery_image.png'], description: ['Soft & healthy', 'Whole wheat', 'For breakfast'], inStock: true },
    { name: 'Butter Croissant 100g', category: 'Bakery', price: 50, offerPrice: 45, image: ['/images/bakery_image.png'], description: ['Flaky & buttery', 'Freshly baked', 'For breakfast'], inStock: true },
    { name: 'Chocolate Cake 500g', category: 'Bakery', price: 350, offerPrice: 325, image: ['/images/bakery_image.png'], description: ['Rich & moist', 'Premium cocoa', 'Celebrations'], inStock: true },
    { name: 'Whole Wheat Bread 400g', category: 'Bakery', price: 45, offerPrice: 40, image: ['/images/bakery_image.png'], description: ['Healthy', 'Whole wheat flour', 'For sandwiches'], inStock: true },
    { name: 'Vanilla Muffins 6pcs', category: 'Bakery', price: 100, offerPrice: 90, image: ['/images/bakery_image.png'], description: ['Soft & fluffy', 'Quick snack', 'Real vanilla'], inStock: true },
    { name: 'Pav Bun 6pcs', category: 'Bakery', price: 30, offerPrice: 26, image: ['/images/bakery_image.png'], description: ['Soft & fresh', 'For pav bhaji', 'Bakery fresh'], inStock: true },
    { name: 'Fruit Cake 400g', category: 'Bakery', price: 180, offerPrice: 165, image: ['/images/bakery_image.png'], description: ['Dryfruit mix', 'Moist & flavourful', 'Festive pick'], inStock: true },
    { name: 'Assorted Cookies 200g', category: 'Bakery', price: 80, offerPrice: 72, image: ['/images/bakery_image.png'], description: ['Crunchy & sweet', 'Assorted flavours', 'With tea'], inStock: true },
    { name: 'Pita Bread 4pcs', category: 'Bakery', price: 90, offerPrice: 82, image: ['/images/bakery_image.png'], description: ['Soft flatbread', 'For wraps', 'Oven fresh'], inStock: true },
    { name: 'Rusk 200g', category: 'Bakery', price: 35, offerPrice: 30, image: ['/images/bakery_image.png'], description: ['Crunchy & sweet', 'With chai', 'Long shelf life'], inStock: true },

    // ─── GRAINS ───
    { name: 'Basmati Rice 5kg', category: 'Grains', price: 550, offerPrice: 520, image: ['/images/grain_image.png'], description: ['Long grain aromatic', 'For biryani', 'Premium quality'], inStock: true },
    { name: 'Wheat Flour 5kg', category: 'Grains', price: 250, offerPrice: 230, image: ['/images/grain_image.png'], description: ['Quality wheat', 'Fluffy rotis', 'Nutrient rich'], inStock: true },
    { name: 'Quinoa 500g', category: 'Grains', price: 450, offerPrice: 420, image: ['/images/quinoa_image.png'], description: ['High protein', 'Gluten free', 'Vitamin rich'], inStock: true },
    { name: 'Brown Rice 1kg', category: 'Grains', price: 120, offerPrice: 110, image: ['/images/grain_image.png'], description: ['Whole grain', 'Weight management', 'Magnesium rich'], inStock: true },
    { name: 'Barley 1kg', category: 'Grains', price: 150, offerPrice: 140, image: ['/images/barley_image.png'], description: ['Fiber rich', 'Good digestion', 'Low fat'], inStock: true },
    { name: 'Oats 1kg', category: 'Grains', price: 180, offerPrice: 165, image: ['/images/grain_image.png'], description: ['Heart healthy', 'Beta-glucan rich', 'Filling breakfast'], inStock: true },
    { name: 'Sona Masoori Rice 5kg', category: 'Grains', price: 400, offerPrice: 375, image: ['/images/grain_image.png'], description: ['Light & fluffy', 'Low starch', 'South Indian fav'], inStock: true },
    { name: 'Moong Dal 1kg', category: 'Grains', price: 130, offerPrice: 120, image: ['/images/grain_image.png'], description: ['High protein', 'Easy to digest', 'Nutritious'], inStock: true },
    { name: 'Chana Dal 1kg', category: 'Grains', price: 110, offerPrice: 100, image: ['/images/grain_image.png'], description: ['Protein rich', 'Nutty flavour', 'Versatile dal'], inStock: true },
    { name: 'Toor Dal 1kg', category: 'Grains', price: 145, offerPrice: 135, image: ['/images/grain_image.png'], description: ['Staple lentil', 'Dal tadka essential', 'Protein rich'], inStock: true },

    // ─── SNACKS ───
    { name: 'Lays Classic 75g', category: 'Snacks', price: 30, offerPrice: 25, image: ['/images/snacks_image.png'], description: ['Crispy chips', 'Classic salted', 'Party snack'], inStock: true },
    { name: 'Kurkure Masala 90g', category: 'Snacks', price: 25, offerPrice: 20, image: ['/images/snacks_image.png'], description: ['Crunchy & spicy', 'Tangy masala', 'Evening snack'], inStock: true },
    { name: 'Bingo Mad Angles 90g', category: 'Snacks', price: 20, offerPrice: 18, image: ['/images/snacks_image.png'], description: ['Unique shape', 'Bold spicy', 'Fun to munch'], inStock: true },
    { name: 'Pringles Original 107g', category: 'Snacks', price: 160, offerPrice: 148, image: ['/images/snacks_image.png'], description: ['Stacked chips', 'Original salted', 'Premium snack'], inStock: true },
    { name: 'Haldiram Bhujia 200g', category: 'Snacks', price: 80, offerPrice: 72, image: ['/images/snacks_image.png'], description: ['Crispy & spicy', 'Traditional namkeen', 'Tea time'], inStock: true },
    { name: 'Too Yumm 70g', category: 'Snacks', price: 25, offerPrice: 22, image: ['/images/snacks_image.png'], description: ['Baked not fried', 'Multigrain', 'Guilt free'], inStock: true },
    { name: 'Cornitos Nachos 150g', category: 'Snacks', price: 90, offerPrice: 82, image: ['/images/snacks_image.png'], description: ['Crunchy nachos', 'With dip', 'Party fav'], inStock: true },
    { name: 'Parle G 400g', category: 'Snacks', price: 35, offerPrice: 30, image: ['/images/snacks_image.png'], description: ['Glucose biscuit', 'With tea', 'Classic taste'], inStock: true },
    { name: 'Oreo 300g', category: 'Snacks', price: 75, offerPrice: 68, image: ['/images/snacks_image.png'], description: ['Cream cookies', 'Chocolate sandwich', 'Twist lick'], inStock: true },
    { name: 'Butter Popcorn 100g', category: 'Snacks', price: 50, offerPrice: 45, image: ['/images/snacks_image.png'], description: ['Ready to eat', 'Buttery flavour', 'Movie snack'], inStock: true },

    // ─── SPICES ───
    { name: 'MDH Chana Masala 100g', category: 'Spices', price: 55, offerPrice: 50, image: ['/images/spices_image.png'], description: ['Aromatic blend', 'Authentic flavour', 'For curries'], inStock: true },
    { name: 'Everest Turmeric 200g', category: 'Spices', price: 40, offerPrice: 35, image: ['/images/spices_image.png'], description: ['Pure natural turmeric', 'Antioxidants', 'Cooking essential'], inStock: true },
    { name: 'Catch Red Chilli 200g', category: 'Spices', price: 45, offerPrice: 40, image: ['/images/spices_image.png'], description: ['Hot & spicy', 'Adds colour', 'For curries'], inStock: true },
    { name: 'Cumin Seeds 200g', category: 'Spices', price: 80, offerPrice: 72, image: ['/images/spices_image.png'], description: ['Whole jeera', 'Aromatic', 'Tempering essential'], inStock: true },
    { name: 'Coriander Powder 200g', category: 'Spices', price: 38, offerPrice: 34, image: ['/images/spices_image.png'], description: ['Earthy & mild', 'Freshly ground', 'All curries'], inStock: true },
    { name: 'Garam Masala 100g', category: 'Spices', price: 65, offerPrice: 58, image: ['/images/spices_image.png'], description: ['Warming blend', 'Rich aroma', 'Finishing spice'], inStock: true },
    { name: 'Kitchen King 100g', category: 'Spices', price: 60, offerPrice: 54, image: ['/images/spices_image.png'], description: ['All-in-one masala', 'Any dish', 'Bold profile'], inStock: true },
    { name: 'Black Pepper 100g', category: 'Spices', price: 120, offerPrice: 110, image: ['/images/spices_image.png'], description: ['Pungent & sharp', 'Freshly ground', 'Universal spice'], inStock: true },
    { name: 'Mustard Seeds 200g', category: 'Spices', price: 35, offerPrice: 30, image: ['/images/spices_image.png'], description: ['Small & pungent', 'Tempering staple', 'South Indian'], inStock: true },
    { name: 'Kashmiri Red Chilli 100g', category: 'Spices', price: 90, offerPrice: 82, image: ['/images/spices_image.png'], description: ['Deep red colour', 'Mild heat', 'Rich colour to dishes'], inStock: true },

    // ─── PERSONAL CARE ───
    { name: 'Dove Shampoo 180ml', category: 'Personal', price: 120, offerPrice: 110, image: ['/images/personal_care_image.png'], description: ['Nourishing formula', 'Silky smooth hair', 'Daily use'], inStock: true },
    { name: 'Dettol Soap 75g', category: 'Personal', price: 35, offerPrice: 30, image: ['/images/personal_care_image.png'], description: ['Antibacterial', 'Germ protection', 'Gentle skin'], inStock: true },
    { name: 'Nivea Body Lotion 200ml', category: 'Personal', price: 180, offerPrice: 165, image: ['/images/personal_care_image.png'], description: ['Deep moisture', 'Non-greasy', 'All skin types'], inStock: true },
    { name: 'Colgate Toothpaste 150g', category: 'Personal', price: 80, offerPrice: 72, image: ['/images/personal_care_image.png'], description: ['Triple action', 'Cavity guard', 'Fresh breath'], inStock: true },
    { name: 'Head & Shoulders 200ml', category: 'Personal', price: 165, offerPrice: 150, image: ['/images/personal_care_image.png'], description: ['Anti-dandruff', 'Scalp care', 'Clinical strength'], inStock: true },
    { name: 'Gillette Shaving Gel 200g', category: 'Personal', price: 210, offerPrice: 195, image: ['/images/personal_care_image.png'], description: ['Smooth shave', 'Moisturising', 'Skin protection'], inStock: true },
    { name: 'Ponds Face Wash 100g', category: 'Personal', price: 95, offerPrice: 86, image: ['/images/personal_care_image.png'], description: ['Deep cleanse', 'Removes tan', 'Brightening formula'], inStock: true },
    { name: 'Vaseline Lip Balm 4.8g', category: 'Personal', price: 65, offerPrice: 58, image: ['/images/personal_care_image.png'], description: ['Moisturises lips', 'Long lasting', 'SPF protection'], inStock: true },
    { name: 'Sunscreen SPF50 75ml', category: 'Personal', price: 250, offerPrice: 230, image: ['/images/personal_care_image.png'], description: ['SPF 50 protect', 'Water resistant', 'Non-greasy'], inStock: true },
    { name: 'Hand Sanitizer 500ml', category: 'Personal', price: 120, offerPrice: 108, image: ['/images/personal_care_image.png'], description: ['Kills 99.9% germs', 'No water needed', 'Fresh scent'], inStock: true },

    // ─── FROZEN FOODS ───
    { name: 'McCain Frozen Fries 400g', category: 'Frozen', price: 160, offerPrice: 145, image: ['/images/frozen_foods_image.png'], description: ['Ready in minutes', 'Crispy golden', 'Perfect snack'], inStock: true },
    { name: 'Frozen Green Peas 500g', category: 'Frozen', price: 80, offerPrice: 70, image: ['/images/frozen_foods_image.png'], description: ['Farm fresh frozen', 'Protein rich', 'Ready to cook'], inStock: true },
    { name: 'Frozen Sweet Corn 500g', category: 'Frozen', price: 85, offerPrice: 75, image: ['/images/frozen_foods_image.png'], description: ['Sweet kernels', 'Flash frozen', 'Nutrients retain'], inStock: true },
    { name: 'McCain Smiles 415g', category: 'Frozen', price: 175, offerPrice: 160, image: ['/images/frozen_foods_image.png'], description: ['Smiley snacks', 'Kids fav', 'Oven ready'], inStock: true },
    { name: 'Frozen Paneer Tikka 200g', category: 'Frozen', price: 150, offerPrice: 138, image: ['/images/paneer_image.png'], description: ['Marinated paneer', 'Grill ready', 'Party starter'], inStock: true },
    { name: 'Frozen Paratha 5pcs', category: 'Frozen', price: 90, offerPrice: 82, image: ['/images/frozen_foods_image.png'], description: ['Whole wheat', '2 min ready', 'Homestyle taste'], inStock: true },
    { name: 'Frozen Mixed Veg 500g', category: 'Frozen', price: 95, offerPrice: 86, image: ['/images/frozen_foods_image.png'], description: ['8 veg blend', 'Flash frozen', 'Stir fry ready'], inStock: true },
    { name: 'Frozen Samosa 10pcs', category: 'Frozen', price: 120, offerPrice: 110, image: ['/images/frozen_foods_image.png'], description: ['Crispy samosa', 'Fry ready', 'Perfect snack'], inStock: true },
    { name: 'Frozen Chicken Nuggets 300g', category: 'Frozen', price: 220, offerPrice: 198, image: ['/images/frozen_foods_image.png'], description: ['Crispy coating', 'Juicy inside', 'Kids love'], inStock: true },
    { name: 'Frozen Edamame 400g', category: 'Frozen', price: 180, offerPrice: 165, image: ['/images/frozen_foods_image.png'], description: ['Healthy soy beans', 'High protein', 'Ready eat'], inStock: true },

    // ─── SWEETS & MITHAI ───
    { name: 'Gulab Jamun 500g', category: 'Sweets', price: 220, offerPrice: 200, image: ['/images/sweets_mithai_image.png'], description: ['Soft & spongy', 'Soaked in sugar syrup', 'Celebration sweet'], inStock: true },
    { name: 'Kaju Katli 250g', category: 'Sweets', price: 350, offerPrice: 320, image: ['/images/sweets_mithai_image.png'], description: ['Premium cashew sweet', 'Melt in mouth', 'Gift ready'], inStock: true },
    { name: 'Besan Ladoo 500g', category: 'Sweets', price: 280, offerPrice: 260, image: ['/images/sweets_mithai_image.png'], description: ['Traditional Indian sweet', 'Ghee rich', 'Festival fav'], inStock: true },
    { name: 'Jalebi 250g', category: 'Sweets', price: 140, offerPrice: 128, image: ['/images/sweets_mithai_image.png'], description: ['Crispy & syrupy', 'Classic Indian sweet', 'With rabri'], inStock: true },
    { name: 'Sooji Halwa 400g', category: 'Sweets', price: 160, offerPrice: 148, image: ['/images/sweets_mithai_image.png'], description: ['Semolina dessert', 'Ghee roasted', 'Temple style'], inStock: true },
    { name: 'Milk Barfi 250g', category: 'Sweets', price: 200, offerPrice: 185, image: ['/images/sweets_mithai_image.png'], description: ['Soft milk fudge', 'Cardamom flavoured', 'Festive pick'], inStock: true },
    { name: 'Rasgulla 1kg', category: 'Sweets', price: 240, offerPrice: 220, image: ['/images/sweets_mithai_image.png'], description: ['Spongy cottage cheese', 'Sugar syrup soaked', 'Bengali delight'], inStock: true },
    { name: 'Milk Peda 200g', category: 'Sweets', price: 180, offerPrice: 166, image: ['/images/sweets_mithai_image.png'], description: ['Condensed milk sweet', 'Cardamom aroma', 'Offering sweet'], inStock: true },
    { name: 'Kheer Mix 100g', category: 'Sweets', price: 55, offerPrice: 49, image: ['/images/sweets_mithai_image.png'], description: ['Instant kheer mix', 'Creamy dessert', 'Ready in 10min'], inStock: true },
    { name: 'Mysore Pak 200g', category: 'Sweets', price: 160, offerPrice: 148, image: ['/images/sweets_mithai_image.png'], description: ['Gram flour sweet', 'Ghee rich', 'South Indian classic'], inStock: true },

    // ─── TEA & COFFEE ───
    { name: 'Tata Tea Gold 500g', category: 'Tea', price: 270, offerPrice: 250, image: ['/images/tea_coffee_image.png'], description: ['Bold & refreshing', 'Premium tea leaves', 'Perfect morning brew'], inStock: true },
    { name: 'Nescafe Classic 100g', category: 'Tea', price: 260, offerPrice: 240, image: ['/images/tea_coffee_image.png'], description: ['Rich roasted aroma', 'Instant coffee', 'Wake up refreshed'], inStock: true },
    { name: 'Red Label Tea 500g', category: 'Tea', price: 245, offerPrice: 225, image: ['/images/tea_coffee_image.png'], description: ['Robust flavour', 'Strong brew', 'Daily chai'], inStock: true },
    { name: 'Bru Gold Coffee 200g', category: 'Tea', price: 330, offerPrice: 305, image: ['/images/tea_coffee_image.png'], description: ['Smooth & aromatic', 'Filter coffee taste', 'South Indian blend'], inStock: true },
    { name: 'Green Tea 25bags', category: 'Tea', price: 150, offerPrice: 138, image: ['/images/tea_coffee_image.png'], description: ['Antioxidant rich', 'Boosts metabolism', 'Light refreshing'], inStock: true },
    { name: 'Wagh Bakri Tea 500g', category: 'Tea', price: 265, offerPrice: 245, image: ['/images/tea_coffee_image.png'], description: ['Premium blend', 'Rich aroma', 'Perfect kadak chai'], inStock: true },
    { name: 'Lipton Honey Lemon 25bags', category: 'Tea', price: 110, offerPrice: 98, image: ['/images/tea_coffee_image.png'], description: ['Citrus honey blend', 'Soothing & warm', 'Great for immunity'], inStock: true },
    { name: 'Filter Coffee 500g', category: 'Tea', price: 290, offerPrice: 268, image: ['/images/tea_coffee_image.png'], description: ['Strong decoction', 'Traditional filter method', 'Rich aroma'], inStock: true },
    { name: 'Chamomile Tea 20bags', category: 'Tea', price: 180, offerPrice: 166, image: ['/images/tea_coffee_image.png'], description: ['Calming & soothing', 'Caffeine free', 'Evening relaxation'], inStock: true },
    { name: 'Bournvita 500g', category: 'Tea', price: 280, offerPrice: 258, image: ['/images/tea_coffee_image.png'], description: ['Energy health drink', 'Chocolate malt', 'Vitamin rich'], inStock: true },

    // ─── COOKING OIL ───
    { name: 'Fortune Sunflower Oil 1L', category: 'Oil', price: 140, offerPrice: 128, image: ['/images/cooking_oil_image.png'], description: ['Light & healthy', 'Vitamin E', 'Daily cooking'], inStock: true },
    { name: 'Saffola Gold 1L', category: 'Oil', price: 160, offerPrice: 148, image: ['/images/cooking_oil_image.png'], description: ['Heart healthy blend', 'Low saturated fat', 'Doctor recommended'], inStock: true },
    { name: 'Olive Oil 500ml', category: 'Oil', price: 450, offerPrice: 420, image: ['/images/cooking_oil_image.png'], description: ['Extra virgin', 'Mediterranean classic', 'For salads & dips'], inStock: true },
    { name: 'Mustard Oil 1L', category: 'Oil', price: 130, offerPrice: 118, image: ['/images/cooking_oil_image.png'], description: ['Pungent & rich', 'North Indian essential', 'High smoke point'], inStock: true },
    { name: 'Coconut Oil 500ml', category: 'Oil', price: 200, offerPrice: 185, image: ['/images/cooking_oil_image.png'], description: ['Cold pressed pure', 'Multi-purpose oil', 'Hair & cooking'], inStock: true },
    { name: 'Groundnut Oil 1L', category: 'Oil', price: 170, offerPrice: 155, image: ['/images/cooking_oil_image.png'], description: ['Deep frying oil', 'High smoke point', 'Nutty flavour'], inStock: true },
    { name: 'Palm Oil 1L', category: 'Oil', price: 110, offerPrice: 100, image: ['/images/cooking_oil_image.png'], description: ['Affordable cooking oil', 'Neutral taste', 'High yield'], inStock: true },
    { name: 'Rice Bran Oil 1L', category: 'Oil', price: 155, offerPrice: 142, image: ['/images/cooking_oil_image.png'], description: ['Light & digestible', 'Heart friendly', 'Oryzanol rich'], inStock: true },
    { name: 'Sesame Oil 200ml', category: 'Oil', price: 180, offerPrice: 165, image: ['/images/cooking_oil_image.png'], description: ['Aromatic toasted', 'Asian cooking', 'Nutty finish'], inStock: true },
    { name: 'Flaxseed Oil 200ml', category: 'Oil', price: 220, offerPrice: 200, image: ['/images/cooking_oil_image.png'], description: ['Omega-3 rich', 'Cold pressed', 'Superfood oil'], inStock: true },

    // ─── DRY FRUITS & NUTS ───
    { name: 'Premium Almonds 250g', category: 'DryFruits', price: 280, offerPrice: 260, image: ['/images/dry_fruits_image.png'], description: ['Healthy fats', 'Crunchy & tasty', 'For snacking'], inStock: true },
    { name: 'Cashew Nuts 250g', category: 'DryFruits', price: 320, offerPrice: 295, image: ['/images/dry_fruits_image.png'], description: ['Crispy & buttery', 'Mineral rich', 'Cook & snack'], inStock: true },
    { name: 'Raisins 200g', category: 'DryFruits', price: 120, offerPrice: 110, image: ['/images/dry_fruits_image.png'], description: ['Sweet & chewy', 'Natural sweetener', 'Good for kids'], inStock: true },
    { name: 'Walnuts 200g', category: 'DryFruits', price: 280, offerPrice: 258, image: ['/images/dry_fruits_image.png'], description: ['Brain food', 'Omega-3 rich', 'For desserts'], inStock: true },
    { name: 'Pistachios 200g', category: 'DryFruits', price: 350, offerPrice: 325, image: ['/images/dry_fruits_image.png'], description: ['Crunchy & flavourful', 'Protein rich', 'Shell nuts'], inStock: true },
    { name: 'Dates 500g', category: 'DryFruits', price: 160, offerPrice: 148, image: ['/images/dry_fruits_image.png'], description: ['Natural sweetener', 'Iron & calcium rich', 'Ramzan essential'], inStock: true },
    { name: 'Dried Figs 200g', category: 'DryFruits', price: 180, offerPrice: 165, image: ['/images/dry_fruits_image.png'], description: ['Sweet & chewy', 'Fibre rich', 'Good for bone health'], inStock: true },
    { name: 'Apricots 200g', category: 'DryFruits', price: 200, offerPrice: 182, image: ['/images/dry_fruits_image.png'], description: ['Vitamin A rich', 'Sweet & tangy', 'For baking'], inStock: true },
    { name: 'Roasted Peanuts 500g', category: 'DryFruits', price: 80, offerPrice: 72, image: ['/images/dry_fruits_image.png'], description: ['Crunchy & salty', 'Protein powerhouse', 'Budget nut'], inStock: true },
    { name: 'Mixed Dry Fruits 250g', category: 'DryFruits', price: 280, offerPrice: 260, image: ['/images/dry_fruits_image.png'], description: ['Assorted variety', 'Gift ready pack', 'Nutritious blend'], inStock: true },

    // ─── JUICES & HEALTH DRINKS ───
    { name: 'Real Mango Juice 1L', category: 'Juices', price: 110, offerPrice: 100, image: ['/images/mango_image_1.png'], description: ['100% natural mango', 'No preservatives', 'Refreshing'], inStock: true },
    { name: 'Tropicana Orange 1L', category: 'Juices', price: 120, offerPrice: 109, image: ['/images/orange_image.png'], description: ['Freshly squeezed taste', 'Vitamin C rich', 'Real oranges'], inStock: true },
    { name: 'Aam Panna 200ml', category: 'Juices', price: 25, offerPrice: 22, image: ['/images/juices_image.png'], description: ['Raw mango drink', 'Sweet & tangy', 'Summer cooler'], inStock: true },
    { name: 'Real Mixed Fruit 1L', category: 'Juices', price: 115, offerPrice: 105, image: ['/images/juices_image.png'], description: ['7 fruits blend', 'Vitamin rich', 'Kids favourite'], inStock: true },
    { name: 'Amla Juice 1L', category: 'Juices', price: 90, offerPrice: 82, image: ['/images/juices_image.png'], description: ['Vitamin C powerhouse', 'Immunity booster', 'Ayurvedic'], inStock: true },
    { name: 'Guava Juice 1L', category: 'Juices', price: 105, offerPrice: 95, image: ['/images/juices_image.png'], description: ['Tropical guava taste', 'Thick & sweet', 'Refreshing drink'], inStock: true },
    { name: 'Coconut Water 200ml', category: 'Juices', price: 40, offerPrice: 35, image: ['/images/juices_image.png'], description: ['Natural electrolytes', 'Pure refreshing', 'Post workout'], inStock: true },
    { name: 'Grape Juice 1L', category: 'Juices', price: 130, offerPrice: 118, image: ['/images/juices_image.png'], description: ['Dark red grapes', 'Antioxidant rich', 'Sweet & smooth'], inStock: true },
    { name: 'Lemon Juice 500ml', category: 'Juices', price: 70, offerPrice: 62, image: ['/images/juices_image.png'], description: ['Pure lemon extract', 'Vitamin C rich', 'For cooking & drinks'], inStock: true },
    { name: 'Boost Health Drink 500g', category: 'Juices', price: 310, offerPrice: 285, image: ['/images/juices_image.png'], description: ['Energy health drink', 'Chocolate malt', 'Stamina booster'], inStock: true },

    // ─── BABY PRODUCTS ───
    { name: 'Nestlé Cerelac 400g', category: 'Baby', price: 280, offerPrice: 260, image: ['/images/baby_products_image.png'], description: ['Nutritious baby food', 'Easy to digest', 'Essential vitamins'], inStock: true },
    { name: 'Johnson Baby Soap 75g', category: 'Baby', price: 55, offerPrice: 48, image: ['/images/baby_products_image.png'], description: ['Gentle on skin', 'No harsh chemicals', 'Mild & soothing'], inStock: true },
    { name: 'Aptamil Formula 400g', category: 'Baby', price: 650, offerPrice: 600, image: ['/images/baby_products_image.png'], description: ['Stage 1 formula', 'Iron & calcium', 'WHO approved'], inStock: true },
    { name: 'Baby Powder 200g', category: 'Baby', price: 90, offerPrice: 82, image: ['/images/baby_products_image.png'], description: ['Talc free gentle', 'Absorbs moisture', 'Fresh baby scent'], inStock: true },
    { name: 'Pampers Pants M 30pcs', category: 'Baby', price: 480, offerPrice: 440, image: ['/images/baby_products_image.png'], description: ['Soft waistband', '12hr protection', 'Easy to put on'], inStock: true },
    { name: 'Baby Shampoo 200ml', category: 'Baby', price: 120, offerPrice: 110, image: ['/images/baby_products_image.png'], description: ['Tear free formula', 'Gentle cleansing', 'No parabens'], inStock: true },
    { name: 'NAN Pro Formula 400g', category: 'Baby', price: 700, offerPrice: 648, image: ['/images/baby_products_image.png'], description: ['Infant formula', 'Probiotic enriched', 'Stage 1 nutrition'], inStock: true },
    { name: 'Baby Wipes 80sheets', category: 'Baby', price: 160, offerPrice: 148, image: ['/images/baby_products_image.png'], description: ['Gentle wet wipes', 'Fragrance free', 'Sensitive skin safe'], inStock: true },
    { name: 'Gripe Water 100ml', category: 'Baby', price: 80, offerPrice: 72, image: ['/images/baby_products_image.png'], description: ['Relieves colic', 'Safe for newborns', 'No alcohol'], inStock: true },
    { name: 'Junior Horlicks 500g', category: 'Baby', price: 320, offerPrice: 295, image: ['/images/baby_products_image.png'], description: ['Height & weight', 'Milk drink for kids', 'Vitamins & minerals'], inStock: true },

    // ─── HOUSEHOLD CLEANING ───
    { name: 'Vim Dishwash 500ml', category: 'Cleaning', price: 80, offerPrice: 72, image: ['/images/cleaning_products_image.png'], description: ['Cuts grease fast', 'Fresh lemon fragrance', 'Gentle on hands'], inStock: true },
    { name: 'Harpic Toilet Cleaner 500ml', category: 'Cleaning', price: 95, offerPrice: 85, image: ['/images/cleaning_products_image.png'], description: ['Kills 99.9% germs', 'Powerful stain removal', 'Fresh scent'], inStock: true },
    { name: 'Colin Glass Cleaner 500ml', category: 'Cleaning', price: 110, offerPrice: 100, image: ['/images/cleaning_products_image.png'], description: ['Streak free shine', 'Glass & mirrors', 'Quick dry'], inStock: true },
    { name: 'Surf Excel 1kg', category: 'Cleaning', price: 210, offerPrice: 195, image: ['/images/cleaning_products_image.png'], description: ['Tough stain removal', 'Bright colours', 'Washing powder'], inStock: true },
    { name: 'Lizol Floor Cleaner 500ml', category: 'Cleaning', price: 130, offerPrice: 118, image: ['/images/cleaning_products_image.png'], description: ['Kills household germs', 'Fresh fragrance', '5 in 1 action'], inStock: true },
    { name: 'Odonil Air Freshener 50g', category: 'Cleaning', price: 55, offerPrice: 48, image: ['/images/cleaning_products_image.png'], description: ['Long lasting freshness', 'Bathroom odour control', 'Floral scent'], inStock: true },
    { name: 'Scotch Brite Scrub 3pcs', category: 'Cleaning', price: 60, offerPrice: 54, image: ['/images/cleaning_products_image.png'], description: ['Tough scrubbing', 'Non-scratch side', 'Long lasting'], inStock: true },
    { name: 'Ariel Washing Liquid 1L', category: 'Cleaning', price: 280, offerPrice: 258, image: ['/images/cleaning_products_image.png'], description: ['Liquid detergent', 'Stain lift technology', 'Front load safe'], inStock: true },
    { name: 'Mortein Spray 200ml', category: 'Cleaning', price: 180, offerPrice: 165, image: ['/images/cleaning_products_image.png'], description: ['Kills on contact', 'Long barrier action', 'Instant knock'], inStock: true },
    { name: 'Good Knight Coil 10pcs', category: 'Cleaning', price: 30, offerPrice: 26, image: ['/images/cleaning_products_image.png'], description: ['8hr mosquito protection', 'Mosquito repellent', 'Safe formula'], inStock: true },

    // ─── MEAT & SEAFOOD ───
    { name: 'Chicken Breast 500g', category: 'Meat', price: 180, offerPrice: 165, image: ['/images/meat_seafood_image.png'], description: ['Fresh & tender', 'High in protein', 'Grilling & curries'], inStock: true },
    { name: 'Fresh Fish Fillet 400g', category: 'Meat', price: 220, offerPrice: 200, image: ['/images/meat_seafood_image.png'], description: ['Ocean fresh', 'Omega-3 rich', 'Frying & baking'], inStock: true },
    { name: 'Mutton 500g', category: 'Meat', price: 380, offerPrice: 350, image: ['/images/meat_seafood_image.png'], description: ['Farm fresh', 'Tender cuts', 'Rich biryani meat'], inStock: true },
    { name: 'Prawns 250g', category: 'Meat', price: 280, offerPrice: 258, image: ['/images/meat_seafood_image.png'], description: ['Cleaned & deveined', 'Ocean fresh', 'Quick cook'], inStock: true },
    { name: 'Whole Chicken 1kg', category: 'Meat', price: 200, offerPrice: 185, image: ['/images/meat_seafood_image.png'], description: ['Cleaned & dressed', 'Farm raised', 'Great for roast'], inStock: true },
    { name: 'Salmon Fillet 300g', category: 'Meat', price: 450, offerPrice: 415, image: ['/images/meat_seafood_image.png'], description: ['Omega-3 rich', 'Premium pink flesh', 'Heart healthy'], inStock: true },
    { name: 'Chicken Eggs 6pcs', category: 'Meat', price: 60, offerPrice: 55, image: ['/images/eggs_image.png'], description: ['Farm fresh', 'Protein rich', 'Daily essential'], inStock: true },
    { name: 'Fresh Crab 500g', category: 'Meat', price: 320, offerPrice: 295, image: ['/images/meat_seafood_image.png'], description: ['Fresh water crab', 'Rich sweet meat', 'Great for curry'], inStock: true },
    { name: 'Tuna Can 185g', category: 'Meat', price: 150, offerPrice: 138, image: ['/images/meat_seafood_image.png'], description: ['Ready to eat', 'High protein', 'Omega-3 rich'], inStock: true },
    { name: 'Chicken Keema 500g', category: 'Meat', price: 190, offerPrice: 175, image: ['/images/meat_seafood_image.png'], description: ['Minced chicken', 'Fresh & lean', 'Perfect for kebabs'], inStock: true },

    // ─── SAUCES & CONDIMENTS ───
    { name: 'Maggi Tomato Ketchup 500g', category: 'Condiments', price: 90, offerPrice: 82, image: ['/images/maggi_image.png'], description: ['Tangy & sweet', 'Goes with everything', 'No artificial colors'], inStock: true },
    { name: 'Dr Oetker Mayonnaise 250g', category: 'Condiments', price: 120, offerPrice: 110, image: ['/images/condiments_image.png'], description: ['Creamy & smooth', 'Perfect for sandwiches', 'Classic rich taste'], inStock: true },
    { name: 'Soy Sauce 200ml', category: 'Condiments', price: 60, offerPrice: 54, image: ['/images/condiments_image.png'], description: ['Dark & savoury', 'Chinese cooking essential', 'Umami flavour'], inStock: true },
    { name: 'Green Chilli Sauce 200g', category: 'Condiments', price: 70, offerPrice: 62, image: ['/images/condiments_image.png'], description: ['Hot & tangy', 'Perfect with momos', 'Indo-Chinese fav'], inStock: true },
    { name: 'Mustard Sauce 200ml', category: 'Condiments', price: 80, offerPrice: 72, image: ['/images/condiments_image.png'], description: ['Sharp & tangy', 'Great for burgers', 'Classic hotdog sauce'], inStock: true },
    { name: 'Heinz Baked Beans 400g', category: 'Condiments', price: 145, offerPrice: 132, image: ['/images/condiments_image.png'], description: ['Tomato sauce beans', 'Ready to eat', 'Protein rich'], inStock: true },
    { name: 'Mango Pickle 400g', category: 'Condiments', price: 80, offerPrice: 72, image: ['/images/mango_image_1.png'], description: ['Tangy raw mango', 'Spicy & oily', 'Traditional recipe'], inStock: true },
    { name: 'White Vinegar 500ml', category: 'Condiments', price: 45, offerPrice: 40, image: ['/images/condiments_image.png'], description: ['Pure distilled', 'Salad dressing use', 'Preserving agent'], inStock: true },
    { name: 'Pasta Sauce 350g', category: 'Condiments', price: 110, offerPrice: 100, image: ['/images/condiments_image.png'], description: ['Tomato basil blend', 'Ready to use', 'Italian classic'], inStock: true },
    { name: 'Schezwan Chutney 250g', category: 'Condiments', price: 75, offerPrice: 68, image: ['/images/condiments_image.png'], description: ['Spicy & flavourful', 'Chinese style', 'Perfect dip'], inStock: true },
];

async function seed() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
        console.log('✅ Connected to MongoDB');
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');
        const inserted = await Product.insertMany(products);
        console.log(`✅ Inserted: ${inserted.length} products`);
        const cats = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
        console.log('\n📦 Summary:');
        cats.forEach(c => console.log(`   ${c._id}: ${c.count} products`));
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}
seed();
