import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    userId: { type: String, required: false }, // Optional, for guest users
    userName: { type: String, required: false },
    contact: { type: String, required: false }, // Phone or Email
    details: { type: String, required: true },
    type: { type: String, default: 'General' }, // Product, Service, General
    status: { type: String, default: 'Open', enum: ['Open', 'In Progress', 'Resolved'] },
    createdAt: { type: Date, default: Date.now }
});

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);

export default Complaint;
