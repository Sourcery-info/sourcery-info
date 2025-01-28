import { logger } from '@sourcery/common/src/logger';
import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(MONGO_URL: string) {
    if (!MONGO_URL) {
        throw new Error('MONGO_URL not set');
    }
    if (isConnected) return;

    try {
        logger.info({ msg: 'Connecting to MongoDB', url: MONGO_URL, tags: ['db', 'info'] });
        await mongoose.connect(MONGO_URL);
        isConnected = true;
        logger.info({ msg: 'MongoDB connected', tags: ['db', 'info'] });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}
