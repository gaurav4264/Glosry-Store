import mongoose from "mongoose";

const healthProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true },
    age: { type: Number, default: null },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    conditions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    notes: { type: String, default: '' },
}, { timestamps: true });

const HealthProfile = mongoose.models.healthProfile || mongoose.model('healthProfile', healthProfileSchema);

export default HealthProfile;
