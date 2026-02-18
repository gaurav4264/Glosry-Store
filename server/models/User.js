import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    cartItems: { type: Object, default: {} },
    loyaltyPoints: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    membershipTier: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Bronze' },
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'address', default: null },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
}, { minimize: false })

const User = mongoose.models.user || mongoose.model('user', userSchema)

export default User