import Shop from "../models/Shop.js";

// Seed 20 Dummy Shops
export const seedShops = async (req, res) => {
    try {
        // Clear existing shops
        await Shop.deleteMany({});

        const shops = [];
        const centerLat = 25.5941;
        const centerLng = 85.1376;

        const allCategories = ['Fresh Fruits', 'Organic Veggies', 'Dairy Products', 'Bakery & Breads', 'Instant Food', 'Cold Drinks', 'Grains & Cereals'];

        for (let i = 0; i < 20; i++) {
            const latOffset = (Math.random() - 0.5) * 0.5;
            const lngOffset = (Math.random() - 0.5) * 0.5;

            // Randomly assign 2-4 categories to each shop
            const numCategories = Math.floor(Math.random() * 3) + 2;
            const shopCategories = [];
            const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
            for (let j = 0; j < numCategories; j++) {
                shopCategories.push(shuffled[j]);
            }

            shops.push({
                name: `Grocery Shop ${i + 1}`,
                address: `Street ${i + 1}, City Area`,
                location: {
                    type: "Point",
                    coordinates: [centerLng + lngOffset, centerLat + latOffset]
                },
                categories: shopCategories
            });
        }

        await Shop.insertMany(shops);
        res.json({ success: true, message: "20 Dummy Shops Seeded!" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Shops within 30km
export const getNearbyShops = async (req, res) => {
    try {
        const { lat, lng } = req.body; // Expecting user location

        if (!lat || !lng) {
            return res.json({ success: false, message: "Location required" });
        }

        const shops = await Shop.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: 30000 // 30km in meters
                }
            }
        });

        res.json({ success: true, shops });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get All Shops (for selection) : /api/shop/all
export const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find().limit(20).sort({ name: 1 });
        res.json({ success: true, shops });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Shops by Category within 30km : /api/shop/category
export const getShopsByCategory = async (req, res) => {
    try {
        const { lat, lng, category } = req.body;

        if (!lat || !lng || !category) {
            return res.json({ success: false, message: "Location and category required" });
        }

        const shops = await Shop.find({
            categories: category,
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: 30000 // 30km in meters
                }
            }
        });

        res.json({ success: true, shops, count: shops.length });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
