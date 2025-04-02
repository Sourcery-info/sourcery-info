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

import mongoose, { Schema, Document } from 'mongoose';
import type { User, UserSettings } from '@sourcery/common/types/User.type';
if (mongoose.models.User) {
    mongoose.deleteModel('User');
}
const UserSettingsSchema = new Schema<UserSettings>({
    theme: String,
    language: String,
    notifications: Boolean,
    vector_model: String,
    chat_model: String,
    temperature: Number,
    security: String
}, { strict: false, _id: false });

const UserSchema = new Schema<User & Document>({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    username: { 
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
    membership_id: [{
        type: Schema.Types.ObjectId,
        ref: 'Membership'
    }],
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    },
    approved: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Boolean,
        default: false
    },
    two_factor_enabled: {
        type: Boolean,
        default: false
    },
    two_factor_secret: String,
    two_factor_backup_codes: [String]
}, {
    versionKey: '__v',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

UserSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const UserModel = mongoose.model<User & Document>('User', UserSchema);
