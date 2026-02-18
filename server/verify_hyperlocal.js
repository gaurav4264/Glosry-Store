
const BASE_URL = 'http://127.0.0.1:4000/api';

const runVerification = async () => {
    try {
        console.log("1. Seeding Shops...");
        const seedRes = await fetch(`${BASE_URL}/shop/seed`, { method: 'POST' });
        const seedData = await seedRes.json();
        console.log("Seed Result:", seedData);

        console.log("\n2. Fetching Nearby Shops (Center of Patna)...");
        // 25.5941, 85.1376
        const nearbyRes = await fetch(`${BASE_URL}/shop/nearby`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: 25.5941, lng: 85.1376 })
        });
        const nearbyData = await nearbyRes.json();
        console.log(`Found ${nearbyData.shops ? nearbyData.shops.length : 0} shops within 30km.`);

        if (nearbyData.shops && nearbyData.shops.length > 0) {
            console.log("First Shop:", nearbyData.shops[0].name, nearbyData.shops[0].location);
        }

        console.log("\n3. Fetching Far Away Shops (New York)...");
        const farRes = await fetch(`${BASE_URL}/shop/nearby`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: 40.7128, lng: -74.0060 })
        });
        const farData = await farRes.json();
        console.log(`Found ${farData.shops ? farData.shops.length : 0} shops (Expected 0).`);

    } catch (error) {
        console.error("Verification Failed:", error.message);
    }
};

runVerification();
