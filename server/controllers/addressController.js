import Address from "../models/Address.js"


// Add Address : /api/address/add
export const addAddress = async (req, res) => {
    try {
        const { address, userId, isDefault } = req.body

        // For MVP/Demo: Generate a random location near our "center" (Patna) 
        // consistent with shop seeding so distance checks work.
        // Center: 25.5941, 85.1376
        const centerLat = 25.5941;
        const centerLng = 85.1376;
        const latOffset = (Math.random() - 0.5) * 0.1; // +/- 0.05 deg (~5km)
        const lngOffset = (Math.random() - 0.5) * 0.1;

        const location = {
            type: "Point",
            coordinates: [centerLng + lngOffset, centerLat + latOffset]
        }

        const newAddress = await Address.create({ ...address, userId, location });

        // Update default address if requested
        if (isDefault) {
            import('../models/User.js').then(async ({ default: User }) => {
                await User.findByIdAndUpdate(userId, { defaultAddress: newAddress._id });
            });
        }

        res.json({ success: true, message: "Address added successfully" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get Address : /api/address/get
export const getAddress = async (req, res) => {
    try {
        const { userId } = req.body
        const addresses = await Address.find({ userId })
        res.json({ success: true, addresses })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Set Default Address : /api/address/default
export const setDefaultAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.body;
        // Dynamic import to avoid circular dependency if User imports Address
        const User = (await import('../models/User.js')).default;

        await User.findByIdAndUpdate(userId, { defaultAddress: addressId });
        res.json({ success: true, message: "Default Address Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
