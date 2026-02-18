import StockNotification from "../models/StockNotification.js";
import Product from "../models/Product.js";

// Request Notification : /api/notify/request
export const requestNotification = async (req, res) => {
    try {
        const { userId, productId, email } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        if (product.inStock) {
            return res.json({ success: false, message: "Product is already in stock" });
        }

        const existingRequest = await StockNotification.findOne({ userId, productId, status: 'Pending' });
        if (existingRequest) {
            return res.json({ success: false, message: "You are already subscribed for notifications" });
        }

        await StockNotification.create({ userId, productId, email });

        return res.json({ success: true, message: "We'll notify you when it's back in stock!" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
