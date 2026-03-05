import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';

const lf = (kw, lock) => [`https://loremflickr.com/400/400/${kw}?lock=${lock}`];

const products2 = [
    // ─── SPICES ───
    { name: 'MDH Chana Masala 100g', category: 'Spices', price: 55, offerPrice: 50, image: lf('spice,masala', 1), description: ['Aromatic blend', 'Authentic flavour', 'For curries'], inStock: true },
    { name: 'Everest Turmeric 200g', category: 'Spices', price: 40, offerPrice: 35, image: lf('turmeric', 1), description: ['Pure natural turmeric', 'Antioxidant rich', 'Cooking essential'], inStock: true },
    { name: 'Catch Red Chilli 200g', category: 'Spices', price: 45, offerPrice: 40, image: lf('red,chili', 1), description: ['Hot & spicy', 'Adds vibrant colour', 'For curries'], inStock: true },
    { name: 'Cumin Seeds 200g', category: 'Spices', price: 80, offerPrice: 72, image: lf('cumin,seeds', 1), description: ['Whole jeera seeds', 'Aromatic', 'Tempering essential'], inStock: true },
    { name: 'Coriander Powder 200g', category: 'Spices', price: 38, offerPrice: 34, image: lf('coriander', 1), description: ['Earthy & mild', 'Freshly ground', 'All curries'], inStock: true },
    { name: 'Garam Masala 100g', category: 'Spices', price: 65, offerPrice: 58, image: lf('spice,blend', 1), description: ['Warming blend', 'Rich aroma', 'Finishing spice'], inStock: true },
    { name: 'Kitchen King 100g', category: 'Spices', price: 60, offerPrice: 54, image: lf('indian,spices', 1), description: ['All-in-one masala', 'Any dish', 'Bold profile'], inStock: true },
    { name: 'Black Pepper 100g', category: 'Spices', price: 120, offerPrice: 110, image: lf('black,pepper', 1), description: ['Pungent & sharp', 'Freshly ground', 'Universal spice'], inStock: true },
    { name: 'Mustard Seeds 200g', category: 'Spices', price: 35, offerPrice: 30, image: lf('mustard,seeds', 1), description: ['Small & pungent', 'Tempering staple', 'South Indian'], inStock: true },
    { name: 'Kashmiri Red Chilli 100g', category: 'Spices', price: 90, offerPrice: 82, image: lf('chili,powder', 1), description: ['Deep red colour', 'Mild heat', 'Rich colour to dishes'], inStock: true },

    // ─── PERSONAL CARE ───
    { name: 'Dove Shampoo 180ml', category: 'Personal', price: 120, offerPrice: 110, image: lf('shampoo', 1), description: ['Nourishing formula', 'Silky smooth hair', 'Daily use'], inStock: true },
    { name: 'Dettol Soap 75g', category: 'Personal', price: 35, offerPrice: 30, image: lf('soap,bar', 1), description: ['Antibacterial', 'Germ protection', 'Gentle skin'], inStock: true },
    { name: 'Nivea Body Lotion 200ml', category: 'Personal', price: 180, offerPrice: 165, image: lf('body,lotion', 1), description: ['Deep moisture', 'Non-greasy', 'All skin types'], inStock: true },
    { name: 'Colgate Toothpaste 150g', category: 'Personal', price: 80, offerPrice: 72, image: lf('toothpaste', 1), description: ['Triple action', 'Cavity guard', 'Fresh breath'], inStock: true },
    { name: 'Head & Shoulders 200ml', category: 'Personal', price: 165, offerPrice: 150, image: lf('hair,shampoo', 1), description: ['Anti-dandruff', 'Scalp care', 'Clinical strength'], inStock: true },
    { name: 'Gillette Shaving Gel 200g', category: 'Personal', price: 210, offerPrice: 195, image: lf('shaving,cream', 1), description: ['Smooth shave', 'Moisturising', 'Skin protection'], inStock: true },
    { name: 'Ponds Face Wash 100g', category: 'Personal', price: 95, offerPrice: 86, image: lf('face,wash', 1), description: ['Deep cleanse', 'Removes tan', 'Brightening formula'], inStock: true },
    { name: 'Vaseline Lip Balm 4.8g', category: 'Personal', price: 65, offerPrice: 58, image: lf('lip,balm', 1), description: ['Moisturises lips', 'Long lasting', 'SPF protection'], inStock: true },
    { name: 'Sunscreen SPF50 75ml', category: 'Personal', price: 250, offerPrice: 230, image: lf('sunscreen', 1), description: ['SPF 50 protect', 'Water resistant', 'Non-greasy'], inStock: true },
    { name: 'Hand Sanitizer 500ml', category: 'Personal', price: 120, offerPrice: 108, image: lf('hand,sanitizer', 1), description: ['Kills 99.9% germs', 'No water needed', 'Fresh scent'], inStock: true },

    // ─── FROZEN FOODS ───
    { name: 'McCain Frozen Fries 400g', category: 'Frozen', price: 160, offerPrice: 145, image: lf('french,fries', 1), description: ['Ready in minutes', 'Crispy golden', 'Perfect snack'], inStock: true },
    { name: 'Frozen Green Peas 500g', category: 'Frozen', price: 80, offerPrice: 70, image: lf('green,peas', 1), description: ['Farm fresh frozen', 'Protein rich', 'Ready to cook'], inStock: true },
    { name: 'Frozen Sweet Corn 500g', category: 'Frozen', price: 85, offerPrice: 75, image: lf('sweet,corn', 1), description: ['Sweet corn kernels', 'Flash frozen', 'Nutrients retain'], inStock: true },
    { name: 'McCain Smiles 415g', category: 'Frozen', price: 175, offerPrice: 160, image: lf('frozen,snack', 1), description: ['Smiley potato snacks', 'Kids fav', 'Oven ready'], inStock: true },
    { name: 'Frozen Paneer Tikka 200g', category: 'Frozen', price: 150, offerPrice: 138, image: lf('paneer,tikka', 1), description: ['Marinated paneer', 'Grill ready', 'Party starter'], inStock: true },
    { name: 'Frozen Paratha 5pcs', category: 'Frozen', price: 90, offerPrice: 82, image: lf('indian,flatbread', 1), description: ['Whole wheat', '2 min ready', 'Homestyle taste'], inStock: true },
    { name: 'Frozen Mixed Veg 500g', category: 'Frozen', price: 95, offerPrice: 86, image: lf('frozen,vegetables', 1), description: ['8 veg blend', 'Flash frozen', 'Stir fry ready'], inStock: true },
    { name: 'Frozen Samosa 10pcs', category: 'Frozen', price: 120, offerPrice: 110, image: lf('samosa', 1), description: ['Crispy samosa', 'Fry ready', 'Perfect tea snack'], inStock: true },
    { name: 'Frozen Chicken Nuggets 300g', category: 'Frozen', price: 220, offerPrice: 198, image: lf('chicken,nuggets', 1), description: ['Crispy coating', 'Juicy inside', 'Kids love'], inStock: true },
    { name: 'Frozen Edamame 400g', category: 'Frozen', price: 180, offerPrice: 165, image: lf('edamame', 1), description: ['Healthy soy beans', 'High protein', 'Ready eat'], inStock: true },

    // ─── SWEETS & MITHAI ───
    { name: 'Gulab Jamun 500g', category: 'Sweets', price: 220, offerPrice: 200, image: lf('gulab,jamun', 1), description: ['Soft & spongy', 'Soaked in sugar syrup', 'Celebration sweet'], inStock: true },
    { name: 'Kaju Katli 250g', category: 'Sweets', price: 350, offerPrice: 320, image: lf('indian,sweet', 1), description: ['Premium cashew sweet', 'Melt in mouth', 'Gift ready'], inStock: true },
    { name: 'Besan Ladoo 500g', category: 'Sweets', price: 280, offerPrice: 260, image: lf('ladoo,sweet', 1), description: ['Traditional Indian sweet', 'Ghee rich', 'Festival fav'], inStock: true },
    { name: 'Jalebi 250g', category: 'Sweets', price: 140, offerPrice: 128, image: lf('jalebi', 1), description: ['Crispy & syrupy', 'Classic Indian sweet', 'With rabri'], inStock: true },
    { name: 'Sooji Halwa 400g', category: 'Sweets', price: 160, offerPrice: 148, image: lf('halwa,dessert', 1), description: ['Semolina dessert', 'Ghee roasted', 'Temple style'], inStock: true },
    { name: 'Milk Barfi 250g', category: 'Sweets', price: 200, offerPrice: 185, image: lf('barfi,sweet', 1), description: ['Soft milk fudge', 'Cardamom flavoured', 'Festive pick'], inStock: true },
    { name: 'Rasgulla 1kg', category: 'Sweets', price: 240, offerPrice: 220, image: lf('rasgulla', 1), description: ['Spongy cottage cheese', 'Sugar syrup soaked', 'Bengali delight'], inStock: true },
    { name: 'Milk Peda 200g', category: 'Sweets', price: 180, offerPrice: 166, image: lf('milk,sweet', 1), description: ['Condensed milk sweet', 'Cardamom aroma', 'Offering sweet'], inStock: true },
    { name: 'Kheer Mix 100g', category: 'Sweets', price: 55, offerPrice: 49, image: lf('rice,pudding', 1), description: ['Instant kheer mix', 'Creamy dessert', 'Ready in 10min'], inStock: true },
    { name: 'Mysore Pak 200g', category: 'Sweets', price: 160, offerPrice: 148, image: lf('indian,mithai', 1), description: ['Gram flour sweet', 'Ghee rich', 'South Indian classic'], inStock: true },

    // ─── TEA & COFFEE ───
    { name: 'Tata Tea Gold 500g', category: 'Tea', price: 270, offerPrice: 250, image: lf('tea,leaves', 1), description: ['Bold & refreshing', 'Premium tea leaves', 'Perfect morning brew'], inStock: true },
    { name: 'Nescafe Classic 100g', category: 'Tea', price: 260, offerPrice: 240, image: lf('coffee,cup', 1), description: ['Rich roasted aroma', 'Instant coffee', 'Wake up refreshed'], inStock: true },
    { name: 'Red Label Tea 500g', category: 'Tea', price: 245, offerPrice: 225, image: lf('chai,tea', 1), description: ['Robust flavour', 'Strong brew', 'Daily chai'], inStock: true },
    { name: 'Bru Gold Coffee 200g', category: 'Tea', price: 330, offerPrice: 305, image: lf('coffee,beans', 1), description: ['Smooth & aromatic', 'Filter coffee taste', 'South Indian blend'], inStock: true },
    { name: 'Green Tea 25bags', category: 'Tea', price: 150, offerPrice: 138, image: lf('green,tea', 1), description: ['Antioxidant rich', 'Boosts metabolism', 'Light refreshing'], inStock: true },
    { name: 'Wagh Bakri Tea 500g', category: 'Tea', price: 265, offerPrice: 245, image: lf('tea,cup', 1), description: ['Premium blend', 'Rich aroma', 'Perfect kadak chai'], inStock: true },
    { name: 'Lipton Honey Lemon 25bags', category: 'Tea', price: 110, offerPrice: 98, image: lf('lemon,tea', 1), description: ['Citrus honey blend', 'Soothing & warm', 'Great for immunity'], inStock: true },
    { name: 'Filter Coffee 500g', category: 'Tea', price: 290, offerPrice: 268, image: lf('filter,coffee', 1), description: ['Strong decoction', 'Traditional filter method', 'Rich aroma'], inStock: true },
    { name: 'Chamomile Tea 20bags', category: 'Tea', price: 180, offerPrice: 166, image: lf('chamomile,tea', 1), description: ['Calming & soothing', 'Caffeine free', 'Evening relaxation'], inStock: true },
    { name: 'Bournvita 500g', category: 'Tea', price: 280, offerPrice: 258, image: lf('chocolate,milk', 1), description: ['Energy health drink', 'Chocolate malt', 'Vitamin rich'], inStock: true },

    // ─── COOKING OIL ───
    { name: 'Fortune Sunflower Oil 1L', category: 'Oil', price: 140, offerPrice: 128, image: lf('sunflower,oil', 1), description: ['Light & healthy', 'Vitamin E rich', 'Daily cooking'], inStock: true },
    { name: 'Saffola Gold 1L', category: 'Oil', price: 160, offerPrice: 148, image: lf('cooking,oil', 1), description: ['Heart healthy blend', 'Low saturated fat', 'Doctor recommended'], inStock: true },
    { name: 'Olive Oil 500ml', category: 'Oil', price: 450, offerPrice: 420, image: lf('olive,oil', 1), description: ['Extra virgin', 'Mediterranean classic', 'For salads & dips'], inStock: true },
    { name: 'Mustard Oil 1L', category: 'Oil', price: 130, offerPrice: 118, image: lf('mustard,oil', 1), description: ['Pungent & rich', 'North Indian essential', 'High smoke point'], inStock: true },
    { name: 'Coconut Oil 500ml', category: 'Oil', price: 200, offerPrice: 185, image: lf('coconut,oil', 1), description: ['Cold pressed pure', 'Multi-purpose oil', 'Hair & cooking'], inStock: true },
    { name: 'Groundnut Oil 1L', category: 'Oil', price: 170, offerPrice: 155, image: lf('peanut,oil', 1), description: ['Deep frying oil', 'High smoke point', 'Nutty flavour'], inStock: true },
    { name: 'Palm Oil 1L', category: 'Oil', price: 110, offerPrice: 100, image: lf('oil,jar', 1), description: ['Affordable cooking oil', 'Neutral taste', 'High yield'], inStock: true },
    { name: 'Rice Bran Oil 1L', category: 'Oil', price: 155, offerPrice: 142, image: lf('rice,bran,oil', 1), description: ['Light & digestible', 'Heart friendly', 'Oryzanol rich'], inStock: true },
    { name: 'Sesame Oil 200ml', category: 'Oil', price: 180, offerPrice: 165, image: lf('sesame,oil', 1), description: ['Aromatic toasted oil', 'Asian cooking', 'Nutty finish'], inStock: true },
    { name: 'Flaxseed Oil 200ml', category: 'Oil', price: 220, offerPrice: 200, image: lf('flaxseed,oil', 1), description: ['Omega-3 rich', 'Cold pressed', 'Superfood oil'], inStock: true },

    // ─── DRY FRUITS ───
    { name: 'Premium Almonds 250g', category: 'DryFruits', price: 280, offerPrice: 260, image: lf('almonds', 1), description: ['Healthy fats', 'Crunchy & tasty', 'For snacking'], inStock: true },
    { name: 'Cashew Nuts 250g', category: 'DryFruits', price: 320, offerPrice: 295, image: lf('cashew', 1), description: ['Crispy & buttery', 'Mineral rich', 'Cook & snack'], inStock: true },
    { name: 'Raisins 200g', category: 'DryFruits', price: 120, offerPrice: 110, image: lf('raisins', 1), description: ['Sweet & chewy', 'Natural sweetener', 'Good for kids'], inStock: true },
    { name: 'Walnuts 200g', category: 'DryFruits', price: 280, offerPrice: 258, image: lf('walnuts', 1), description: ['Brain food', 'Omega-3 rich', 'For desserts'], inStock: true },
    { name: 'Pistachios 200g', category: 'DryFruits', price: 350, offerPrice: 325, image: lf('pistachios', 1), description: ['Crunchy & flavourful', 'Protein rich', 'Shell nuts'], inStock: true },
    { name: 'Dates 500g', category: 'DryFruits', price: 160, offerPrice: 148, image: lf('dates,fruit', 1), description: ['Natural sweetener', 'Iron & calcium rich', 'Ramzan essential'], inStock: true },
    { name: 'Dried Figs 200g', category: 'DryFruits', price: 180, offerPrice: 165, image: lf('dried,figs', 1), description: ['Sweet & chewy', 'Fibre rich', 'Good for bone health'], inStock: true },
    { name: 'Apricots 200g', category: 'DryFruits', price: 200, offerPrice: 182, image: lf('dried,apricot', 1), description: ['Vitamin A rich', 'Sweet & tangy', 'For baking'], inStock: true },
    { name: 'Roasted Peanuts 500g', category: 'DryFruits', price: 80, offerPrice: 72, image: lf('peanuts', 1), description: ['Crunchy & salty', 'Protein powerhouse', 'Budget nut'], inStock: true },
    { name: 'Mixed Dry Fruits 250g', category: 'DryFruits', price: 280, offerPrice: 260, image: lf('mixed,nuts', 1), description: ['Assorted variety', 'Gift ready pack', 'Nutritious blend'], inStock: true },

    // ─── JUICES ───
    { name: 'Real Mango Juice 1L', category: 'Juices', price: 110, offerPrice: 100, image: lf('mango,juice', 2), description: ['100% natural mango', 'No preservatives', 'Refreshing'], inStock: true },
    { name: 'Tropicana Orange 1L', category: 'Juices', price: 120, offerPrice: 109, image: lf('orange,juice', 1), description: ['Freshly squeezed taste', 'Vitamin C rich', 'Real oranges'], inStock: true },
    { name: 'Aam Panna 200ml', category: 'Juices', price: 25, offerPrice: 22, image: lf('mango,drink', 1), description: ['Raw mango drink', 'Sweet & tangy', 'Summer cooler'], inStock: true },
    { name: 'Real Mixed Fruit 1L', category: 'Juices', price: 115, offerPrice: 105, image: lf('fruit,juice', 1), description: ['7 fruits blend', 'Vitamin rich', 'Kids favourite'], inStock: true },
    { name: 'Amla Juice 1L', category: 'Juices', price: 90, offerPrice: 82, image: lf('gooseberry,juice', 1), description: ['Vitamin C powerhouse', 'Immunity booster', 'Ayurvedic'], inStock: true },
    { name: 'Guava Juice 1L', category: 'Juices', price: 105, offerPrice: 95, image: lf('guava,juice', 1), description: ['Tropical guava taste', 'Thick & sweet', 'Refreshing drink'], inStock: true },
    { name: 'Coconut Water 200ml', category: 'Juices', price: 40, offerPrice: 35, image: lf('coconut,water', 1), description: ['Natural electrolytes', 'Pure refreshing', 'Post workout'], inStock: true },
    { name: 'Grape Juice 1L', category: 'Juices', price: 130, offerPrice: 118, image: lf('grape,juice', 1), description: ['Dark red grapes', 'Antioxidant rich', 'Sweet & smooth'], inStock: true },
    { name: 'Lemon Juice 500ml', category: 'Juices', price: 70, offerPrice: 62, image: lf('lemon,juice', 1), description: ['Pure lemon extract', 'Vitamin C rich', 'For cooking & drinks'], inStock: true },
    { name: 'Boost Health Drink 500g', category: 'Juices', price: 310, offerPrice: 285, image: lf('energy,drink', 1), description: ['Energy health drink', 'Chocolate malt', 'Stamina booster'], inStock: true },

    // ─── BABY PRODUCTS ───
    { name: 'Nestlé Cerelac 400g', category: 'Baby', price: 280, offerPrice: 260, image: lf('baby,food', 1), description: ['Nutritious baby food', 'Easy to digest', 'Essential vitamins'], inStock: true },
    { name: 'Johnson Baby Soap 75g', category: 'Baby', price: 55, offerPrice: 48, image: lf('baby,soap', 1), description: ['Gentle on skin', 'No harsh chemicals', 'Mild & soothing'], inStock: true },
    { name: 'Aptamil Formula 400g', category: 'Baby', price: 650, offerPrice: 600, image: lf('baby,formula', 1), description: ['Stage 1 formula', 'Iron & calcium', 'WHO approved'], inStock: true },
    { name: 'Baby Powder 200g', category: 'Baby', price: 90, offerPrice: 82, image: lf('baby,powder', 1), description: ['Talc free gentle', 'Absorbs moisture', 'Fresh baby scent'], inStock: true },
    { name: 'Pampers Pants M 30pcs', category: 'Baby', price: 480, offerPrice: 440, image: lf('baby,diaper', 1), description: ['Soft waistband', '12hr protection', 'Easy to put on'], inStock: true },
    { name: 'Baby Shampoo 200ml', category: 'Baby', price: 120, offerPrice: 110, image: lf('baby,bath', 1), description: ['Tear free formula', 'Gentle cleansing', 'No parabens'], inStock: true },
    { name: 'NAN Pro Formula 400g', category: 'Baby', price: 700, offerPrice: 648, image: lf('infant,formula', 1), description: ['Infant formula', 'Probiotic enriched', 'Stage 1 nutrition'], inStock: true },
    { name: 'Baby Wipes 80sheets', category: 'Baby', price: 160, offerPrice: 148, image: lf('baby,wipes', 1), description: ['Gentle wet wipes', 'Fragrance free', 'Sensitive skin safe'], inStock: true },
    { name: 'Gripe Water 100ml', category: 'Baby', price: 80, offerPrice: 72, image: lf('baby,care', 1), description: ['Relieves colic', 'Safe for newborns', 'No alcohol'], inStock: true },
    { name: 'Junior Horlicks 500g', category: 'Baby', price: 320, offerPrice: 295, image: lf('kids,drink', 1), description: ['Height & weight', 'Milk drink for kids', 'Vitamins & minerals'], inStock: true },

    // ─── HOUSEHOLD CLEANING ───
    { name: 'Vim Dishwash 500ml', category: 'Cleaning', price: 80, offerPrice: 72, image: lf('dish,soap', 1), description: ['Cuts grease fast', 'Fresh lemon fragrance', 'Gentle on hands'], inStock: true },
    { name: 'Harpic Toilet Cleaner 500ml', category: 'Cleaning', price: 95, offerPrice: 85, image: lf('toilet,cleaner', 1), description: ['Kills 99.9% germs', 'Powerful stain removal', 'Fresh scent'], inStock: true },
    { name: 'Colin Glass Cleaner 500ml', category: 'Cleaning', price: 110, offerPrice: 100, image: lf('glass,cleaner', 1), description: ['Streak free shine', 'Glass & mirrors', 'Quick dry'], inStock: true },
    { name: 'Surf Excel 1kg', category: 'Cleaning', price: 210, offerPrice: 195, image: lf('laundry,detergent', 1), description: ['Tough stain removal', 'Bright colours', 'Washing powder'], inStock: true },
    { name: 'Lizol Floor Cleaner 500ml', category: 'Cleaning', price: 130, offerPrice: 118, image: lf('floor,cleaner', 1), description: ['Kills household germs', 'Fresh fragrance', '5 in 1 action'], inStock: true },
    { name: 'Odonil Air Freshener 50g', category: 'Cleaning', price: 55, offerPrice: 48, image: lf('air,freshener', 1), description: ['Long lasting freshness', 'Bathroom odour control', 'Floral scent'], inStock: true },
    { name: 'Scotch Brite Scrub 3pcs', category: 'Cleaning', price: 60, offerPrice: 54, image: lf('scrubber,sponge', 1), description: ['Tough scrubbing', 'Non-scratch side', 'Long lasting'], inStock: true },
    { name: 'Ariel Washing Liquid 1L', category: 'Cleaning', price: 280, offerPrice: 258, image: lf('washing,liquid', 1), description: ['Liquid detergent', 'Stain lift technology', 'Front load safe'], inStock: true },
    { name: 'Mortein Spray 200ml', category: 'Cleaning', price: 180, offerPrice: 165, image: lf('insect,spray', 1), description: ['Kills on contact', 'Long barrier action', 'Instant knock'], inStock: true },
    { name: 'Good Knight Coil 10pcs', category: 'Cleaning', price: 30, offerPrice: 26, image: lf('mosquito,repellent', 1), description: ['8hr mosquito protection', 'Mosquito repellent', 'Safe formula'], inStock: true },

    // ─── MEAT & SEAFOOD ───
    { name: 'Chicken Breast 500g', category: 'Meat', price: 180, offerPrice: 165, image: lf('chicken,breast', 1), description: ['Fresh & tender', 'High in protein', 'Grilling & curries'], inStock: true },
    { name: 'Fresh Fish Fillet 400g', category: 'Meat', price: 220, offerPrice: 200, image: lf('fish,fillet', 1), description: ['Ocean fresh', 'Omega-3 rich', 'Frying & baking'], inStock: true },
    { name: 'Mutton 500g', category: 'Meat', price: 380, offerPrice: 350, image: lf('mutton,meat', 1), description: ['Farm fresh', 'Tender cuts', 'Rich biryani meat'], inStock: true },
    { name: 'Prawns 250g', category: 'Meat', price: 280, offerPrice: 258, image: lf('prawns,shrimp', 1), description: ['Cleaned & deveined', 'Ocean fresh', 'Quick cook'], inStock: true },
    { name: 'Whole Chicken 1kg', category: 'Meat', price: 200, offerPrice: 185, image: lf('whole,chicken', 1), description: ['Cleaned & dressed', 'Farm raised', 'Great for roast'], inStock: true },
    { name: 'Salmon Fillet 300g', category: 'Meat', price: 450, offerPrice: 415, image: lf('salmon,fish', 1), description: ['Omega-3 rich', 'Premium pink flesh', 'Heart healthy'], inStock: true },
    { name: 'Chicken Eggs 6pcs', category: 'Meat', price: 60, offerPrice: 55, image: lf('eggs,fresh', 1), description: ['Farm fresh', 'Protein rich', 'Daily essential'], inStock: true },
    { name: 'Fresh Crab 500g', category: 'Meat', price: 320, offerPrice: 295, image: lf('crab,seafood', 1), description: ['Fresh water crab', 'Rich sweet meat', 'Great for curry'], inStock: true },
    { name: 'Tuna Can 185g', category: 'Meat', price: 150, offerPrice: 138, image: lf('tuna,can', 1), description: ['Ready to eat', 'High protein', 'Omega-3 rich'], inStock: true },
    { name: 'Chicken Keema 500g', category: 'Meat', price: 190, offerPrice: 175, image: lf('minced,chicken', 1), description: ['Minced chicken', 'Fresh & lean', 'Perfect for kebabs'], inStock: true },

    // ─── SAUCES & CONDIMENTS ───
    { name: 'Maggi Tomato Ketchup 500g', category: 'Condiments', price: 90, offerPrice: 82, image: lf('ketchup', 1), description: ['Tangy & sweet', 'Goes with everything', 'No artificial colors'], inStock: true },
    { name: 'Dr Oetker Mayonnaise 250g', category: 'Condiments', price: 120, offerPrice: 110, image: lf('mayonnaise', 1), description: ['Creamy & smooth', 'Perfect for sandwiches', 'Classic rich taste'], inStock: true },
    { name: 'Soy Sauce 200ml', category: 'Condiments', price: 60, offerPrice: 54, image: lf('soy,sauce', 1), description: ['Dark & savoury', 'Chinese cooking essential', 'Umami flavour'], inStock: true },
    { name: 'Green Chilli Sauce 200g', category: 'Condiments', price: 70, offerPrice: 62, image: lf('chili,sauce', 1), description: ['Hot & tangy', 'Perfect with momos', 'Indo-Chinese fav'], inStock: true },
    { name: 'Mustard Sauce 200ml', category: 'Condiments', price: 80, offerPrice: 72, image: lf('mustard', 1), description: ['Sharp & tangy', 'Great for burgers', 'Classic hotdog sauce'], inStock: true },
    { name: 'Heinz Baked Beans 400g', category: 'Condiments', price: 145, offerPrice: 132, image: lf('baked,beans', 1), description: ['Tomato sauce beans', 'Ready to eat', 'Protein rich'], inStock: true },
    { name: 'Mango Pickle 400g', category: 'Condiments', price: 80, offerPrice: 72, image: lf('mango,pickle', 1), description: ['Tangy raw mango', 'Spicy & oily', 'Traditional recipe'], inStock: true },
    { name: 'White Vinegar 500ml', category: 'Condiments', price: 45, offerPrice: 40, image: lf('vinegar,bottle', 1), description: ['Pure distilled', 'Salad dressing use', 'Preserving agent'], inStock: true },
    { name: 'Pasta Sauce 350g', category: 'Condiments', price: 110, offerPrice: 100, image: lf('pasta,sauce', 1), description: ['Tomato basil blend', 'Ready to use', 'Italian classic'], inStock: true },
    { name: 'Schezwan Chutney 250g', category: 'Condiments', price: 75, offerPrice: 68, image: lf('hot,chutney', 1), description: ['Spicy & flavourful', 'Chinese style', 'Perfect dip'], inStock: true },
];

async function seed2() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
        console.log('Connected to MongoDB');
        await Product.insertMany(products2);
        console.log(`Part 2 done: ${products2.length} products`);
        const total = await Product.countDocuments();
        const cats = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
        console.log(`\n✅ Total in DB: ${total}`);
        cats.forEach(c => console.log(`   ${c._id}: ${c.count}`));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}
seed2();
