import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Counter for generating sequential IDs
const counterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 1000 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

// Auto-generate unique IDs
async function generateId(prefix, counterName) {
    const counter = await Counter.findOneAndUpdate(
        { name: counterName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return `${prefix}${counter.seq}`;
}

const sellerApplicationSchema = new mongoose.Schema({
    // Auto-generated IDs
    applicationNumber: { type: String, unique: true },
    shopRegNumber: { type: String, unique: true },
    sellerId: { type: String, unique: true },

    // Personal Verification
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    aadhaarNumber: { type: String, required: true },
    panNumber: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    gstNumber: { type: String, default: "" },

    // Document Uploads (Cloudinary URLs)
    aadhaarImage: { type: String, default: "" },
    panImage: { type: String, default: "" },
    passportPhoto: { type: String, default: "" },

    // Shop Details
    shopName: { type: String, required: true },
    area: { type: String, default: "" },          // Area / Sector (e.g., Sector 17)
    pickupAddress: { type: String, default: "" }, // Pickup address for orders
    shopLogo: { type: String, default: "" },      // Cloudinary URL
    shopCategory: {
        type: String,
        required: true,
        enum: ['Grocery', 'Vegetables', 'Fruits', 'Dairy', 'Snacks', 'Household Items', 'Bakery', 'Beverages', 'Personal Care', 'Other']
    },
    shopAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    landmark: { type: String, default: "" },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },

    // Auth (set after approval)
    password: { type: String, default: "" },

    // Application Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'hold'],
        default: 'pending'
    },
    adminRemarks: { type: String, default: "" },
    registrationDate: { type: Date, default: Date.now },
    approvedAt: { type: Date },

    // Track if password been set by seller
    passwordSet: { type: Boolean, default: false }

}, { timestamps: true });

sellerApplicationSchema.index({ location: "2dsphere" });

// Auto-generate IDs before saving
sellerApplicationSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.applicationNumber = await generateId('APP2026', 'applicationCounter');
        this.shopRegNumber = await generateId('SHOP2026', 'shopCounter');
        this.sellerId = await generateId('SEL2026', 'sellerCounter');
    }
    next();
});

// Hash password before saving
sellerApplicationSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const SellerApplication = mongoose.models.SellerApplication || mongoose.model('SellerApplication', sellerApplicationSchema);

export default SellerApplication;
export { Counter };
