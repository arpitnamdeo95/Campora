import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import listingRouter from './routes/listings';
import profileRouter from './routes/profile';
import priceRouter from './routes/prices';
import wishlistRouter from './routes/wishlist';
import offerRouter from './routes/offers';
import notificationRouter from './routes/notifications';
import boostRouter from './routes/boost';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/listings', listingRouter);
app.use('/api/profile', profileRouter);
app.use('/api/price', priceRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/offers', offerRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/boost', boostRouter);

// Root
app.get('/', (req, res) => {
    res.json({ message: 'CampusKart API v1.0.0', status: 'Running' });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({
        error: err.message || 'Internal Server Error',
        details: err.details || null,
        hint: err.hint || null
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
