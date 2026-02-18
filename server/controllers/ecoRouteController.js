import Order from '../models/Order.js';
import Address from '../models/Address.js';

// Eco Route calculation with carbon footprint
const VEHICLE_EMISSIONS = {
    bicycle: { co2PerKm: 0, label: '🚲 Bicycle', speed: 15 },
    ev: { co2PerKm: 0.05, label: '🔋 Electric Vehicle', speed: 35 },
    bike: { co2PerKm: 0.08, label: '🛵 Motorbike', speed: 40 },
    standard: { co2PerKm: 0.21, label: '🚗 Car', speed: 45 },
};

// Calculate distance between two geo points (Haversine)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Get Eco Route : POST /api/eco-route/calculate
export const getEcoRoute = async (req, res) => {
    try {
        const { userId, vehicle, shopLocation, deliveryLocation } = req.body;

        const vType = vehicle || 'ev';
        const vehicleInfo = VEHICLE_EMISSIONS[vType] || VEHICLE_EMISSIONS.ev;

        // Default locations if not provided
        const shopLat = shopLocation?.lat || 25.5941;
        const shopLng = shopLocation?.lng || 85.1376;
        const deliveryLat = deliveryLocation?.lat || 25.6100;
        const deliveryLng = deliveryLocation?.lng || 85.1500;

        // Calculate standard route distance
        const standardDistance = haversineDistance(shopLat, shopLng, deliveryLat, deliveryLng);

        // Eco route is ~10% shorter (optimized path)
        const ecoDistance = standardDistance * 0.9;

        // Calculate emissions
        const standardCO2 = standardDistance * VEHICLE_EMISSIONS.standard.co2PerKm;
        const ecoCO2 = ecoDistance * vehicleInfo.co2PerKm;
        const co2Saved = standardCO2 - ecoCO2;

        // Calculate time
        const ecoTime = (ecoDistance / vehicleInfo.speed) * 60; // minutes
        const standardTime = (standardDistance / VEHICLE_EMISSIONS.standard.speed) * 60;

        // Generate waypoints for the route
        const waypoints = [];
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            // Add some curve to make it look like a real route
            const midOffset = Math.sin(t * Math.PI) * 0.003;
            waypoints.push({
                lat: shopLat + (deliveryLat - shopLat) * t + midOffset,
                lng: shopLng + (deliveryLng - shopLng) * t - midOffset * 0.5
            });
        }

        // Eco achievements
        const treesEquivalent = co2Saved / 21; // 1 tree absorbs ~21kg CO2/year

        res.json({
            success: true,
            route: {
                vehicle: vehicleInfo.label,
                vehicleType: vType,
                ecoDistance: Math.round(ecoDistance * 100) / 100,
                standardDistance: Math.round(standardDistance * 100) / 100,
                distanceSaved: Math.round((standardDistance - ecoDistance) * 100) / 100,
                ecoCO2: Math.round(ecoCO2 * 1000) / 1000,
                standardCO2: Math.round(standardCO2 * 1000) / 1000,
                co2Saved: Math.round(co2Saved * 1000) / 1000,
                ecoTime: Math.round(ecoTime),
                standardTime: Math.round(standardTime),
                timeDiff: Math.round(standardTime - ecoTime),
                treesEquivalent: Math.round(treesEquivalent * 100) / 100,
                waypoints,
                shopLocation: { lat: shopLat, lng: shopLng },
                deliveryLocation: { lat: deliveryLat, lng: deliveryLng }
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Delivery Eco Stats : GET /api/eco-route/stats
export const getDeliveryStats = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({ userId, status: 'Delivered' });

        // Simulated cumulative eco stats based on order count
        const totalDeliveries = orders.length;
        const totalDistanceKm = totalDeliveries * 3.5; // avg 3.5 km per delivery
        const co2SavedTotal = totalDeliveries * 0.45; // avg eco savings
        const treesPlanted = co2SavedTotal / 21;
        const fuelSavedLiters = totalDeliveries * 0.15;

        const ecoScore = Math.min(100, totalDeliveries * 10 + 20);

        // Badges
        const badges = [];
        if (totalDeliveries >= 1) badges.push({ name: '🌱 Eco Starter', desc: 'Made your first eco delivery!' });
        if (totalDeliveries >= 5) badges.push({ name: '🌿 Green Champion', desc: '5 eco-friendly deliveries' });
        if (totalDeliveries >= 10) badges.push({ name: '🌳 Planet Saver', desc: '10+ eco deliveries' });
        if (co2SavedTotal >= 1) badges.push({ name: '💨 Carbon Cutter', desc: 'Saved 1+ kg of CO2' });
        if (co2SavedTotal >= 5) badges.push({ name: '🏆 Eco Hero', desc: 'Saved 5+ kg of CO2' });

        res.json({
            success: true,
            stats: {
                totalDeliveries,
                totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
                co2SavedTotal: Math.round(co2SavedTotal * 100) / 100,
                treesPlanted: Math.round(treesPlanted * 100) / 100,
                fuelSavedLiters: Math.round(fuelSavedLiters * 100) / 100,
                ecoScore,
                badges
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
