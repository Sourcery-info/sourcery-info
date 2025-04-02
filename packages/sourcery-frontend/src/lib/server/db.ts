// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
