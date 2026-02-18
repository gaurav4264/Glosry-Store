import mongoose from 'mongoose';

const ownerProfileSchema = new mongoose.Schema({
    name: { type: String, default: 'Store Owner' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    photo: { type: String, default: '' },
    businessName: { type: String, default: 'My Grocery Store' },
    address: { type: String, default: '' },
    businessHours: { type: String, default: 'Mon - Sat: 8:00 AM - 9:00 PM' },
    sundayHours: { type: String, default: 'Sunday: 9:00 AM - 6:00 PM' },
    about: { type: String, default: '' },
}, { timestamps: true });

const OwnerProfile = mongoose.model('OwnerProfile', ownerProfileSchema);
export default OwnerProfile;
