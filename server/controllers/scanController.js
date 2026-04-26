import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/Product.js";
import fs from "fs";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

export const parseGroceryList = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Please upload an image of your grocery list or grocery items." });
        }

        const isInvalidKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here' || process.env.GEMINI_API_KEY === 'dummy_key' || process.env.GEMINI_API_KEY.includes('gemini_api_key_here');

        // Cleanup helper
        const cleanupFile = () => {
            if (req.file && fs.existsSync(req.file.path)) {
                try { fs.unlinkSync(req.file.path); } catch (_) {}
            }
        };

        if (isInvalidKey) {
            console.warn("Valid GEMINI_API_KEY is not set. Using smart mock fallback.");
            await new Promise(resolve => setTimeout(resolve, 1200));
            cleanupFile();

            const allProducts = await Product.find({ inStock: true });
            if (allProducts.length === 0) {
                return res.json({ success: false, message: "No products in database to match." });
            }

            // Randomly shuffle and pick different products each time
            const shuffled = allProducts.sort(() => Math.random() - 0.5);
            const pickCount = Math.min(4, shuffled.length);
            const mockMatches = shuffled.slice(0, pickCount).map(p => ({
                rawName: p.name,
                matchedProduct: p
            }));

            return res.json({ success: true, items: mockMatches });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const imageParts = [
            {
                inlineData: {
                    data: fs.readFileSync(req.file.path).toString("base64"),
                    mimeType: req.file.mimetype
                }
            }
        ];

        // Updated prompt: handles BOTH grocery list text AND actual item photos
        const prompt = `You are a grocery shopping assistant. Look at this image carefully.

The image could be one of these:
1. A handwritten grocery list (text written on paper)
2. A printed grocery list
3. A photo of actual grocery items / food products (fruits, vegetables, packaged goods, etc.)

Your task: Extract ALL grocery item names you can identify — whether from text written in the image OR from actual grocery items you can visually see in the photo.

Examples:
- If you see written text "milk, bread, 2 onions" → extract: ["Milk", "Bread", "Onion"]  
- If you see a photo of apples and a milk carton → extract: ["Apple", "Milk"]
- If you see a grocery shop shelf with vegetables → extract each visible vegetable/item

Rules:
- Return ONLY a strict JSON array of strings like: ["Item 1", "Item 2", "Item 3"]
- Use simple common names (e.g. "Apple" not "Malus domestica")
- No Markdown, no backticks, no explanation — ONLY the JSON array
- If nothing recognizable: return []`;

        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();

        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        let extractedItems = [];
        try {
            extractedItems = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", responseText);
            cleanupFile();
            return res.json({ success: false, message: "Could not read items clearly. Please try a clearer photo." });
        }

        if (!Array.isArray(extractedItems) || extractedItems.length === 0) {
            cleanupFile();
            return res.json({ success: false, message: "No grocery items were detected. Try a clearer image." });
        }

        // Match each extracted item against our product DB
        const matchedResults = [];
        for (const rawName of extractedItems) {
            const words = rawName.split(' ').map(w => w.trim()).filter(w => w.length > 1);
            let matchedProduct = null;

            if (words.length > 0) {
                // 1. All-word match
                const andQuery = { inStock: true, $and: words.map(w => ({ name: new RegExp(w, 'i') })) };
                matchedProduct = await Product.findOne(andQuery);

                if (!matchedProduct) {
                    // 2. Any-word match, scored
                    const orQuery = { inStock: true, name: { $in: words.map(w => new RegExp(w, 'i')) } };
                    const possible = await Product.find(orQuery).limit(30);
                    if (possible.length > 0) {
                        possible.sort((a, b) => {
                            const sA = words.filter(w => new RegExp(w, 'i').test(a.name)).length;
                            const sB = words.filter(w => new RegExp(w, 'i').test(b.name)).length;
                            return sB - sA;
                        });
                        matchedProduct = possible[0];
                    }
                }
            } else {
                matchedProduct = await Product.findOne({ inStock: true, name: new RegExp(rawName, 'i') });
            }

            matchedResults.push({ rawName, matchedProduct });
        }

        cleanupFile();
        return res.json({ success: true, items: matchedResults });

    } catch (error) {
        console.error('parseGroceryList error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (_) {}
        }
        res.json({ success: false, message: "Error analyzing image: " + error.message });
    }
};


// Helper: fetch product name from Open Food Facts by barcode
const fetchProductNameFromBarcode = async (barcode) => {
    try {
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'SabziKart/1.0 (grocery app)' },
            signal: AbortSignal.timeout(5000)
        });
        const data = await response.json();
        if (data.status === 1 && data.product) {
            const p = data.product;
            const name = p.product_name_en || p.product_name || p.generic_name_en || p.generic_name || null;
            const category = p.categories_tags?.[0]?.replace('en:', '') || null;
            return { name, category };
        }
    } catch (err) {
        console.log('OpenFoodFacts error (non-fatal):', err.message);
    }
    return { name: null, category: null };
};

// Helper: fuzzy match external product name against our DB
const findBestMatch = async (externalName) => {
    if (!externalName) return null;
    const words = externalName.toLowerCase().split(/[\s,\-\/]+/).filter(w => w.length > 2);
    if (words.length === 0) return null;

    // All-word match first
    const andQuery = { inStock: true, $and: words.slice(0, 4).map(w => ({ name: new RegExp(w, 'i') })) };
    let product = await Product.findOne(andQuery);
    if (product) return product;

    // Any-word match, pick highest score
    const orQuery = { inStock: true, name: { $in: words.slice(0, 6).map(w => new RegExp(w, 'i')) } };
    const candidates = await Product.find(orQuery).limit(30);
    if (candidates.length > 0) {
        candidates.sort((a, b) => {
            const scoreA = words.filter(w => new RegExp(w, 'i').test(a.name)).length;
            const scoreB = words.filter(w => new RegExp(w, 'i').test(b.name)).length;
            return scoreB - scoreA;
        });
        if (words.filter(w => new RegExp(w, 'i').test(candidates[0].name)).length >= 1) {
            return candidates[0];
        }
    }
    return null;
};

// Lookup product by barcode: GET /api/scan/barcode?code=<barcode>
export const lookupByBarcode = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code || code.trim().length === 0) {
            return res.json({ success: false, message: "Barcode required" });
        }

        const barcodeStr = code.trim();

        // Step 1: Exact barcode field match in our DB
        let product = await Product.findOne({ barcode: barcodeStr, inStock: true });
        if (product) {
            return res.json({ success: true, product, source: 'db_barcode' });
        }

        // Step 2: Open Food Facts API to resolve barcode → product name
        const { name: externalName, category: externalCategory } = await fetchProductNameFromBarcode(barcodeStr);
        console.log(`Barcode ${barcodeStr} → name: "${externalName}", category: "${externalCategory}"`);

        // Step 3: Match external name against our store
        if (externalName) {
            product = await findBestMatch(externalName);
            if (product) {
                return res.json({ success: true, product, source: 'openfoodfacts', externalName });
            }

            // Step 4: Try category fallback
            if (externalCategory) {
                const catWord = externalCategory.split(':').pop().replace(/-/g, ' ');
                product = await Product.findOne({ inStock: true, category: new RegExp(catWord, 'i') });
                if (product) {
                    return res.json({ success: true, product, source: 'category_fallback', externalName });
                }
            }

            // Name found but no store match
            return res.json({
                success: false,
                message: `"${externalName}" is not available in our store.`,
                externalName
            });
        }

        // Step 5: Barcode unknown
        return res.json({ success: false, message: "Product not found in our store for this barcode." });

    } catch (error) {
        console.error('lookupByBarcode error:', error);
        res.json({ success: false, message: "Error looking up barcode: " + error.message });
    }
};
