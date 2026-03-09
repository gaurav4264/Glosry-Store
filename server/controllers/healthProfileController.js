import HealthProfile from '../models/HealthProfile.js';
import Product from '../models/Product.js';

// ── Save / Update Health Profile ─────────────────────────────────────
// POST /api/health/save
export const saveHealthProfile = async (req, res) => {
    try {
        const { userId, name, age, gender, height, weight, conditions, allergies, notes } = req.body;

        const profile = await HealthProfile.findOneAndUpdate(
            { userId },
            { userId, name, age, gender, height, weight, conditions, allergies, notes },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, profile });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ── Get Health Profile ───────────────────────────────────────────────
// GET /api/health/profile
export const getHealthProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const profile = await HealthProfile.findOne({ userId });
        res.json({ success: true, profile });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ── AI Health Recommendations ────────────────────────────────────────
// POST /api/health/recommend
export const getHealthRecommendations = async (req, res) => {
    try {
        const { userId } = req.body;

        // Fetch saved health profile
        const profile = await HealthProfile.findOne({ userId });
        if (!profile) {
            return res.json({ success: false, message: 'No health profile found. Please save your health profile first.' });
        }

        // Fetch all products from DB
        const allProducts = await Product.find({ inStock: true }).select('name category offerPrice image');

        if (allProducts.length === 0) {
            return res.json({ success: false, message: 'No products available in store.' });
        }

        const { name, age, gender, height, weight, conditions = [], allergies = [], notes } = profile;

        // Build concise product list for AI prompt
        const productList = allProducts.map(p => `${p.name} (${p.category})`).join(', ');

        const prompt = `You are a clinical nutritionist and healthcare advisor for a grocery store called SabziKart.

A user named ${name || 'the patient'} has the following health profile:
- Age: ${age || 'Not specified'} years
- Gender: ${gender || 'Not specified'}
- Height: ${height ? height + ' cm' : 'Not specified'}
- Weight: ${weight ? weight + ' kg' : 'Not specified'}
- Health Conditions: ${conditions.length > 0 ? conditions.join(', ') : 'None'}
- Allergies: ${allergies.length > 0 ? allergies.join(', ') : 'None'}
- Additional Notes: ${notes || 'None'}

The grocery store has these products available: ${productList}

Based ONLY on the products listed above, provide:
1. A list of 6-8 RECOMMENDED products (from the store's product list) that are beneficial for this user's health conditions, with a short reason for each.
2. A list of 4-6 products (from the store's product list) that this user should AVOID, with a short reason for each.
3. 3-4 general dietary tips personalised for this user's health condition.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "recommended": [
    { "name": "product name exactly as listed", "reason": "short reason" }
  ],
  "avoid": [
    { "name": "product name exactly as listed", "reason": "short reason" }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

        let aiResult = null;

        // Try Gemini AI
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_key_here') {
            try {
                const { GoogleGenerativeAI } = await import('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                const result = await model.generateContent(prompt);
                const text = result.response.text().trim();

                // Strip markdown code blocks if present
                const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                aiResult = JSON.parse(cleaned);
            } catch (aiError) {
                console.log('Gemini error, using rule-based fallback:', aiError.message);
            }
        }

        // Rule-based fallback if Gemini is not configured or fails
        if (!aiResult) {
            aiResult = buildRuleBasedRecommendations(conditions, allergies, allProducts);
        }

        // Enrich recommended products with full product data (price, image, _id)
        const enriched = (items, products) => items.map(item => {
            const match = products.find(p =>
                p.name.toLowerCase().includes(item.name.toLowerCase()) ||
                item.name.toLowerCase().includes(p.name.toLowerCase())
            );
            return { ...item, product: match || null };
        });

        res.json({
            success: true,
            recommended: enriched(aiResult.recommended || [], allProducts),
            avoid: enriched(aiResult.avoid || [], allProducts),
            tips: aiResult.tips || [],
            profile
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ── Rule-Based Fallback ──────────────────────────────────────────────
function buildRuleBasedRecommendations(conditions, allergies, allProducts) {
    const lowerConditions = conditions.map(c => c.toLowerCase());

    // Grocery items that are generally good/bad per condition
    const goodKeywords = [];
    const avoidKeywords = [];
    const tips = [];

    if (lowerConditions.includes('diabetes') || lowerConditions.includes('diabetes (type 1 or 2)')) {
        goodKeywords.push('spinach', 'broccoli', 'oats', 'carrot', 'bitter gourd', 'beans', 'lentils', 'dal', 'methi', 'karela', 'tomato', 'cucumber', 'capsicum');
        avoidKeywords.push('sugar', 'white rice', 'potato', 'sweet potato', 'mango', 'banana', 'honey', 'jam', 'biscuit', 'cake', 'bread');
        tips.push('Prefer low-GI vegetables like leafy greens and cruciferous vegetables.', 'Avoid sugary foods and refined carbohydrates.', 'Eat small meals frequently throughout the day.');
    }

    if (lowerConditions.includes('high blood pressure') || lowerConditions.includes('hypertension')) {
        goodKeywords.push('banana', 'spinach', 'oats', 'garlic', 'flaxseed', 'pomegranate', 'tomato', 'beans', 'lentils');
        avoidKeywords.push('salt', 'chips', 'pickle', 'papad', 'processed', 'canned', 'sausage', 'butter');
        tips.push('Reduce sodium intake — avoid pickles and chips.', 'Include potassium-rich foods like banana and spinach to help lower blood pressure.');
    }

    if (lowerConditions.includes('low blood pressure')) {
        goodKeywords.push('salt', 'coffee', 'pomegranate', 'carrot', 'beetroot', 'almond', 'raisin');
        avoidKeywords.push('alcohol', 'rice');
        tips.push('Increase salt and fluid intake moderately.', 'Eat smaller frequent meals to avoid sudden drops in blood pressure.');
    }

    if (lowerConditions.includes('thyroid') || lowerConditions.includes('hypothyroidism')) {
        goodKeywords.push('fish', 'egg', 'almond', 'walnut', 'pumpkin seeds', 'seaweed', 'yogurt', 'mushroom');
        avoidKeywords.push('soy', 'broccoli', 'cabbage', 'cauliflower', 'kale');
        tips.push('Iodine-rich foods like seafood are helpful for thyroid health.', 'Limit cruciferous vegetables if you have hypothyroidism as they may interfere with thyroid hormone production.');
    }

    if (lowerConditions.includes('heart disease')) {
        goodKeywords.push('salmon', 'tuna', 'walnut', 'almond', 'oats', 'olive oil', 'spinach', 'tomato', 'beans', 'garlic', 'flaxseed');
        avoidKeywords.push('butter', 'ghee', 'red meat', 'fried', 'chips', 'cream', 'cheese', 'salt');
        tips.push('Focus on omega-3 rich foods like walnuts and fish.', 'Reduce saturated and trans fats from your diet.');
    }

    if (lowerConditions.includes('kidney disease')) {
        goodKeywords.push('apple', 'cabbage', 'cauliflower', 'garlic', 'onion', 'egg white', 'rice', 'olive oil');
        avoidKeywords.push('banana', 'tomato', 'potato', 'spinach', 'nuts', 'dairy', 'salt', 'orange');
        tips.push('Limit potassium and phosphorus-rich foods.', 'Keep fluid intake as advised by your doctor.');
    }

    if (lowerConditions.includes('obesity')) {
        goodKeywords.push('cucumber', 'lettuce', 'spinach', 'broccoli', 'apple', 'lemon', 'green tea', 'oats', 'beans', 'lentils');
        avoidKeywords.push('sugar', 'fried', 'chips', 'biscuit', 'cookie', 'cake', 'butter', 'cheese', 'cream');
        tips.push('Choose high-fibre, low-calorie foods.', 'Stay hydrated with water and avoid sugary beverages.');
    }

    if (lowerConditions.includes('anaemia') || lowerConditions.includes('anemia')) {
        goodKeywords.push('spinach', 'beetroot', 'beans', 'lentils', 'pomegranate', 'dates', 'raisin', 'broccoli', 'tofu', 'pumpkin seeds');
        avoidKeywords.push('tea', 'coffee', 'dairy');
        tips.push('Eat iron-rich foods like lentils, spinach, and dates.', 'Pair iron-rich foods with vitamin C sources to improve absorption.', 'Avoid tea or coffee with meals as they inhibit iron absorption.');
    }

    // Default tips if no condition matched
    if (tips.length === 0) {
        tips.push('Eat a balanced diet with plenty of vegetables and fruits.', 'Stay hydrated by drinking at least 8 glasses of water daily.', 'Avoid processed and packaged foods as much as possible.');
    }

    // Match good keywords to actual products
    const recommended = [];
    const avoidList = [];
    const usedIds = new Set();

    for (const product of allProducts) {
        const nameLower = product.name.toLowerCase();
        const categoryLower = product.category.toLowerCase();
        const combined = `${nameLower} ${categoryLower}`;

        // Check allergy first
        const isAllergen = allergies.some(a => combined.includes(a.toLowerCase()));
        if (isAllergen) {
            if (!usedIds.has(product._id.toString())) {
                avoidList.push({ name: product.name, reason: `Contains ${allergies.find(a => combined.includes(a.toLowerCase()))} — you are allergic to this.` });
                usedIds.add(product._id.toString());
            }
            continue;
        }

        const isGood = goodKeywords.some(k => combined.includes(k));
        const isBad = avoidKeywords.some(k => combined.includes(k));

        if (isGood && !usedIds.has(product._id.toString()) && recommended.length < 8) {
            const keyword = goodKeywords.find(k => combined.includes(k));
            recommended.push({ name: product.name, reason: `Good for your health condition (${keyword})` });
            usedIds.add(product._id.toString());
        } else if (isBad && !usedIds.has(product._id.toString()) && avoidList.length < 6) {
            const keyword = avoidKeywords.find(k => combined.includes(k));
            avoidList.push({ name: product.name, reason: `Should be avoided (contains ${keyword} which may aggravate your condition)` });
            usedIds.add(product._id.toString());
        }
    }

    // If no recommendations found, pick first 6 products as generic healthy picks
    if (recommended.length === 0) {
        allProducts.slice(0, 6).forEach(p => {
            recommended.push({ name: p.name, reason: 'Generally healthy grocery item suitable for most dietary needs.' });
        });
    }

    return { recommended, avoid: avoidList, tips };
}
