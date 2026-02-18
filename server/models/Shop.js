import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    categories: {
        type: [String],
        default: []
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }]
}, { timestamps: true });

// Index for geospatial queries
shopSchema.index({ location: "2dsphere" });

const Shop = mongoose.models.shop || mongoose.model('shop', shopSchema);

export default Shop;
