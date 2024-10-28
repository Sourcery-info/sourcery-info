import mongoose, { Schema, Document } from 'mongoose';
import type { User, UserSettings } from '@sourcery/common/types/User.type';

const UserSettingsSchema = new Schema<UserSettings>({
    theme: String,
    language: String,
    notifications: Boolean,
    default_vector_model: String,
    default_chat_model: String
}, { strict: false, _id: false });

const UserSchema = new Schema<User & Document>({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    password_hash: { 
        type: String, 
        required: true 
    },
    settings: UserSettingsSchema,
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
});

UserSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const UserModel = mongoose.model<User & Document>('User', UserSchema);
