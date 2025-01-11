import mongoose, { Schema, Document } from 'mongoose';
import type { Config } from '@sourcery/common/types/Config.type';

if (mongoose.models.Config) {
    mongoose.deleteModel('Config');
}

const ConfigSchema = new Schema<Config & Document>({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    value: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        index: true
    },
    updated_at: {
        type: Date,
        default: Date.now,
        index: true
    }
});

ConfigSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const ConfigModel = mongoose.model<Config & Document>('Config', ConfigSchema); 