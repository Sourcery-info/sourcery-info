import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(MONGO_URL: string) {
    if (!MONGO_URL) {
        throw new Error('MONGO_URL not set');
    }
    if (isConnected) return;

    try {
        console.log('Connecting to MongoDB...', MONGO_URL);
        await mongoose.connect(MONGO_URL);
        isConnected = true;
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}
