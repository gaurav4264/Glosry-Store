import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function fetchGoogleImage(query) {
    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        let imageUrl = null;

        // Find the first image that looks like a product (avoiding the tiny icons)
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            // We want base64 data images or valid http links that aren't tiny icons
            if (src && src.startsWith('http') && !src.includes('gstatic.com/images?q=tbn:ANd9GcQ')) {
                // gstatic can be fine, but we ideally want the first real image
                imageUrl = src;
                return false; // break loop
            }
        });

        // If the above failed, try any image with a src
        if (!imageUrl) {
            $('img').each((i, el) => {
                const src = $(el).attr('src');
                if (src && (src.startsWith('http') || src.startsWith('data:image'))) {
                    // skip google logos
                    if (!src.includes('branding/googlelogo')) {
                        imageUrl = src;
                        return false;
                    }
                }
            });
        }

        return imageUrl;
    } catch (err) {
        console.error(`Error fetching for ${query}:`, err.message);
        return null;
    }
}

async function updateImages() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to update`);

        let count = 0;
        for (const p of products) {
            console.log(`Fetching image for: ${p.name}`);
            // Let's search specifically for the product name + "grocery india"
            const imgUrl = await fetchGoogleImage(p.name + " product India");

            if (imgUrl) {
                p.image = [imgUrl];
                await p.save();
                count++;
                console.log(`  -> Saved image for ${p.name}`);
            } else {
                console.log(`  -> Failed to find image for ${p.name}`);
            }

            // tiny delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 500));
        }

        console.log(`\n✅ Finished updating images for ${count} products.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

updateImages();
