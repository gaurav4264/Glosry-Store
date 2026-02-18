import ContactMessage from '../models/ContactMessage.js';
import OwnerProfile from '../models/OwnerProfile.js';
import { v2 as cloudinary } from 'cloudinary';

// User: Send Message
export const sendMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.json({ success: false, message: 'Name, email, and message are required' });
        }
        await ContactMessage.create({ name, email, subject, message });
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Public: Get Owner Profile (for contact page)
export const getOwnerProfile = async (req, res) => {
    try {
        let profile = await OwnerProfile.findOne();
        if (!profile) {
            profile = await OwnerProfile.create({});
        }
        res.json({ success: true, profile });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Seller: Get All Messages
export const getMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        const unreadCount = await ContactMessage.countDocuments({ isRead: false });
        res.json({ success: true, messages, unreadCount });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Seller: Mark Message as Read
export const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.body;
        await ContactMessage.findByIdAndUpdate(messageId, { isRead: true });
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Seller: Delete Message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.body;
        await ContactMessage.findByIdAndDelete(messageId);
        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Seller: Update Owner Profile
export const updateOwnerProfile = async (req, res) => {
    try {
        const { name, email, phone, businessName, address, businessHours, sundayHours, about } = req.body;
        let profile = await OwnerProfile.findOne();
        if (!profile) profile = new OwnerProfile();

        if (name) profile.name = name;
        if (email) profile.email = email;
        if (phone) profile.phone = phone;
        if (businessName) profile.businessName = businessName;
        if (address) profile.address = address;
        if (businessHours) profile.businessHours = businessHours;
        if (sundayHours) profile.sundayHours = sundayHours;
        if (about !== undefined) profile.about = about;

        await profile.save();
        res.json({ success: true, message: 'Profile updated', profile });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Seller: Upload Owner Photo
export const uploadOwnerPhoto = async (req, res) => {
    try {
        const imageFile = req.file;
        if (!imageFile) return res.json({ success: false, message: 'No image provided' });

        const result = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });

        let profile = await OwnerProfile.findOne();
        if (!profile) profile = new OwnerProfile();
        profile.photo = result.secure_url;
        await profile.save();

        res.json({ success: true, message: 'Photo uploaded', profile });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
