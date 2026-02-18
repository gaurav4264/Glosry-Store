import mongoose from "mongoose";

const stockNotificationSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'user' },
    productId: { type: String, required: true, ref: 'product' },
    email: { type: String, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Notified'] },
    createdAt: { type: Date, default: Date.now }
});

const StockNotification = mongoose.models.stockNotification || mongoose.model('stockNotification', stockNotificationSchema);

export default StockNotification;
