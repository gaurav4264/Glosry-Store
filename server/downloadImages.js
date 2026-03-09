import mongoose from 'mongoose';
import 'dotenv/config';
import Product from './models/Product.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const imageDir = path.resolve('../client/public/images/products');
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
}

async function scrapeBingImage(query) {
    try {
        const { data } = await axios.get(`https://www.bing.com/images/search?q=${encodeURIComponent(query + ' product india')}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(data);

        let url = null;
        $('a.iusc').each((i, el) => {
            const m = $(el).attr('m');
            if (m) {
                try {
                    const mData = JSON.parse(m);
                    if (mData.murl && !mData.murl.includes('svg')) {
                        url = mData.murl;
                        return false;
                    }
                } catch (e) { }
            }
        });
        return url;
    } catch (err) {
        console.error('Bing scrape error:', err.message);
        return null;
    }
}

async function downloadImage(url, filepath) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 5000
        });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);
            writer.on('finish', () => resolve(true));
            writer.on('error', reject);
        });
    } catch (err) {
        return false;
    }
}

async function run() {
    await mongoose.connect(`${process.env.MONGODB_URI}/greencart`);
    const products = await Product.find({});
    console.log(`Checking/Downloading exact images for ${products.length} products...`);

    let updated = 0;

    for (const p of products) {
        // Create safe filename
        const safeName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.jpg';
        const localPath = path.join(imageDir, safeName);
        const relativeUrl = `/images/products/${safeName}`;

        // Skip if we already downloaded it AND the DB already points to it
        if (fs.existsSync(localPath) && p.image && p.image[0] === relativeUrl) {
            continue;
        }

        console.log(`Processing: ${p.name}`);

        if (!fs.existsSync(localPath)) {
            let imgUrl = await scrapeBingImage(p.name);
            if (!imgUrl) {
                console.log(`  -> Failed to find link for ${p.name}`);
                continue;
            }

            console.log(`  -> Downloading ${imgUrl}`);
            const success = await downloadImage(imgUrl, localPath);
            if (!success) {
                console.log(`  -> Download failed.`);
                continue;
            }
        }

        p.image = [relativeUrl];
        await p.save();
        updated++;
        console.log(`  -> Saved to DB`);

        // Small delay to be polite to Bing
        await new Promise(r => setTimeout(r, 800));
    }

    console.log(`\n✅ Finished updating exact images. ${updated} products were modified.`);
    process.exit(0);
}

run();
