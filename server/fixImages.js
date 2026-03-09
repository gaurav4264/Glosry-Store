import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function fetchImageDDG(query) {
    try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' grocery india buy')}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(data);

        // Find the first external image link or Bing image link that usually appears in DDG image results
        // Actually html.duckduckgo.com doesn't show images by default unless in image search
        // Let's use Wikipedia or just a better Google Image Regex
        return null;
    } catch (err) {
        return null;
    }
}

async function fetchGoogleRegex(query) {
    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Google stores actual original images in JS variables like:
        // [,["https://example.com/image.jpg",400,400]
        const match = data.match(/\[,"(https:\/\/[^"]+?)",\d+,\d+\]/);
        if (match && match[1]) {
            // Google escapes unicode, so we unescape it
            return match[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
        }
        return null;
    } catch (err) {
        return null;
    }
}

async function fix() {
    await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
    const products = await Product.find({});

    console.log(`Fixing ${products.length} products with real images...`);

    let count = 0;
    for (const p of products) {
        process.stdout.write(`Fetching ${p.name}... `);
        const imgUrl = await fetchGoogleRegex(p.name + " product India");

        if (imgUrl) {
            p.image = [imgUrl];
            await p.save();
            count++;
            console.log(`✅`);
        } else {
            console.log(`❌ Failed`);
        }
        await new Promise(r => setTimeout(r, 600));
    }
    console.log(`Finished fixing ${count} products.`);
    process.exit(0);
}

fix();
