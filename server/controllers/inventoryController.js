import Product from '../models/Product.js';

// Get Low Stock Products : /api/inventory/low-stock
export const getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            stockQuantity: { $lte: Product.schema.path('lowStockThreshold').default() }
        });

        // More precise query
        const lowStockProducts = await Product.find({}).then(prods =>
            prods.filter(p => p.stockQuantity <= p.lowStockThreshold)
        );

        res.json({
            success: true,
            products: lowStockProducts,
            count: lowStockProducts.length
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Update Stock Quantity : /api/inventory/update
export const updateStockQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (quantity < 0) {
            return res.json({ success: false, message: 'Quantity cannot be negative' });
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            {
                stockQuantity: quantity,
                lastRestocked: Date.now(),
                inStock: quantity > 0
            },
            { new: true }
        );

        if (!product) {
            return res.json({ success: false, message: 'Product not found' });
        }

        res.json({
            success: true,
            message: 'Stock updated successfully',
            product
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Deduct Stock After Order : /api/inventory/deduct
export const deductStock = async (req, res) => {
    try {
        const { items } = req.body; // [{productId, quantity}]

        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.json({ success: false, message: `Product ${item.product} not found` });
            }

            if (product.stockQuantity < item.quantity) {
                return res.json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            product.stockQuantity -= item.quantity;
            product.inStock = product.stockQuantity > 0;
            await product.save();
        }

        res.json({
            success: true,
            message: 'Stock deducted successfully'
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Inventory Alerts : /api/inventory/alerts
export const getInventoryAlerts = async (req, res) => {
    try {
        const lowStockProducts = await Product.find({}).then(prods =>
            prods.filter(p => p.stockQuantity <= p.lowStockThreshold)
        );

        const outOfStockProducts = await Product.find({ stockQuantity: 0 });

        res.json({
            success: true,
            alerts: {
                lowStock: lowStockProducts,
                outOfStock: outOfStockProducts,
                totalAlerts: lowStockProducts.length + outOfStockProducts.length
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
