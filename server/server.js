import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';
import shopRouter from './routes/shopRoute.js';
import loyaltyRouter from './routes/loyaltyRoute.js';
import inventoryRouter from './routes/inventoryRoute.js';
import analyticsRouter from './routes/analyticsRoute.js';
import recommendationRouter from './routes/recommendationRoute.js';
import wishlistRouter from './routes/wishlistRoute.js';
import pantryRouter from './routes/pantryRoute.js';
import budgetRouter from './routes/budgetRoute.js';
import userPantryRouter from './routes/userPantryRoute.js';
import contactRouter from './routes/contactRoute.js';
import couponRouter from './routes/couponRoute.js';
// Notify Router for stock alerts
// Notify Router for stock alerts
import notifyRouter from './routes/notifyRoute.js';
import complaintRouter from './routes/complaintRoute.js';

const app = express();
const port = process.env.PORT || 4000;

try {
    await connectDB()
    await connectCloudinary()
} catch (error) {
    console.error("Startup Error:", error)
}

// Allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174']

// Helper function to check allowed origin
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow all origins for now to fix deployment issues
        // In production, you might want to restrict this to specific domains
        return callback(null, true);
    },
    credentials: true
}

// Middleware configuration
app.use(cors(corsOptions));
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send("API is Working"));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/shop', shopRouter);
app.use('/api/loyalty', loyaltyRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/recommend', recommendationRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/pantry', pantryRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/user-pantry', userPantryRouter);
app.use('/api/contact', contactRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/notify', notifyRouter);
app.use('/api/complaint', complaintRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

export default app;