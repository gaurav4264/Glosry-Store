import mongoose from "mongoose";

const pantryItemSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'user' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', default: null },
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unit: { type: String, default: 'pcs', enum: ['pcs', 'kg', 'g', 'L', 'ml', 'dozen', 'pack'] },
    purchaseDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ['fresh', 'expiring-soon', 'expired', 'consumed'], default: 'fresh' },
    consumedQuantity: { type: Number, default: 0 },
    notes: { type: String, default: '' },
}, { timestamps: true })

const PantryItem = mongoose.models.pantryItem || mongoose.model('pantryItem', pantryItemSchema)

export default PantryItem
