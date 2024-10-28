import mongoose from 'mongoose';
import { MONGO_URL } from '$env/static/private';

if (!MONGO_URL) {
    throw new Error('MONGO_URL environment variable not set');
}

let isConnected = false;

export async function connectDB() {
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
