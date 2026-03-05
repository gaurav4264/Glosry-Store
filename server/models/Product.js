import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    ratings: {
        type: [
            {
                userId: { type: String, required: true },
                rating: { type: Number, required: true, min: 1, max: 5 },
                comment: { type: String, required: true },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        default: []
    },
    stockQuantity: { type: Number, default: 100 },
    lowStockThreshold: { type: Number, default: 10 },
    lastRestocked: { type: Date, default: Date.now },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'shop', default: null },
    vendorId: { type: String, default: null },        // SellerApplication._id
    vendorShopName: { type: String, default: null },  // for display
    manufacturingDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
}, { timestamps: true })

const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product