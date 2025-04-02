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
import type { PrivacyPolicy } from '@sourcery/common/types/PrivacyPolicy.type';

if (mongoose.models?.PrivacyPolicy) {
    mongoose.deleteModel('PrivacyPolicy');
}

if (mongoose.models?.UserPrivacyPolicyAcceptance) {
    mongoose.deleteModel('UserPrivacyPolicyAcceptance');
}

const PrivacyPolicySchema = new Schema<PrivacyPolicy & Document>({
    version: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: '__v',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

PrivacyPolicySchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const PrivacyPolicyModel = mongoose.model<PrivacyPolicy & Document>('PrivacyPolicy', PrivacyPolicySchema);