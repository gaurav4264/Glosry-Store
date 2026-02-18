import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    reply: { type: String, default: '' },
}, { timestamps: true });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;
