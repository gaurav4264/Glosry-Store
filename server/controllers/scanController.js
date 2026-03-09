import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/Product.js";
import fs from "fs";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

export const parseGroceryList = async (req, res) => {
    try {
        const isInvalidKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here' || process.env.GEMINI_API_KEY === 'dummy_key';

        if (isInvalidKey) {
            console.warn("Valid GEMINI_API_KEY is not set. Using fallback mock behavior for demonstration.");
            // Wait a sec to simulate processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock matched products
            const allProducts = await Product.find({ inStock: true }).limit(20);
            if (allProducts.length === 0) {
                return res.json({ success: false, message: "No products in database to match." });
            }

            // Return mock matches using the actual names from the DB so it aligns correctly
            const mockMatches = [];
            for (let i = 0; i < Math.min(3, allProducts.length); i++) {
                mockMatches.push({
                    rawName: allProducts[i].name + " (Demo)",
                    matchedProduct: allProducts[i]
                });
            }

            return res.json({ success: true, items: mockMatches });
        }

        if (!req.file) {
            return res.json({ success: false, message: "Please upload an image of your grocery list." });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert uploaded file to Google Generative AI format
        const imageParts = [
            {
                inlineData: {
                    data: fs.readFileSync(req.file.path).toString("base64"),
                    mimeType: req.file.mimetype
                }
            }
        ];

        const prompt = `You are a grocery shopping assistant. Look at this image of a grocery list. 
        Extract the names of all the grocery items written on the list.
        Format your response ONLY as a strict JSON array of strings, like this: ["Item 1", "Item 2", "Item 3"].
        Do not include any Markdown, backticks, or other conversational text. Just the JSON array.`;

        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();

        // Clean up the JSON string in case the model added backticks
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        let extractedItems = [];
        try {
            extractedItems = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("Failed to parse Gemini response as JSON:", responseText);
            return res.json({ success: false, message: "Could not read the items clearly. Please try a better photo." });
        }

        if (!Array.isArray(extractedItems) || extractedItems.length === 0) {
            return res.json({ success: false, message: "No grocery items were detected in the image." });
        }

        // Match extracted items against the database
        const matchedResults = [];

        for (const rawName of extractedItems) {
            const words = rawName.split(' ').map(w => w.trim()).filter(w => w.length > 2);
            let matchedProduct = null;

            if (words.length > 0) {
                // 1. Strict match first: it must contain all words
                const andQuery = { inStock: true, $and: words.map(w => ({ name: new RegExp(w, 'i') })) };
                matchedProduct = await Product.findOne(andQuery);

                if (!matchedProduct) {
                    // 2. Fallback: find items matching ANY word, then score by relevance
                    const regexes = words.map(w => new RegExp(w, 'i'));
                    const orQuery = { inStock: true, name: { $in: regexes } };
                    const possibleMatches = await Product.find(orQuery).limit(30);

                    if (possibleMatches.length > 0) {
                        possibleMatches.sort((a, b) => {
                            const aScore = words.filter(w => new RegExp(w, 'i').test(a.name)).length;
                            const bScore = words.filter(w => new RegExp(w, 'i').test(b.name)).length;
                            return bScore - aScore;
                        });
                        matchedProduct = possibleMatches[0];
                    }
                }
            } else {
                // For single short words
                matchedProduct = await Product.findOne({ inStock: true, name: new RegExp(rawName, 'i') });
            }

            matchedResults.push({
                rawName,
                matchedProduct
            });
        }

        // Delete the temporary uploaded file
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.json({ success: true, items: matchedResults });

    } catch (error) {
        console.error('parseGroceryList error:', error);

        // Cleanup file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.json({ success: false, message: "Error analyzing grocery list: " + error.message });
    }
};
