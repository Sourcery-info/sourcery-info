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
import type { TermsAndConditions, UserTermsAcceptance } from '@sourcery/common/types/TermsAndConditions.type';

if (mongoose.models?.TermsAndConditions) {
    mongoose.deleteModel('TermsAndConditions');
}

if (mongoose.models?.UserTermsAcceptance) {
    mongoose.deleteModel('UserTermsAcceptance');
}

const TermsAndConditionsSchema = new Schema<TermsAndConditions & Document>({
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

const UserTermsAcceptanceSchema = new Schema<UserTermsAcceptance & Document>({
    user_id: {
        type: String,
        required: true,
        index: true
    } as any,
    terms_id: {
        type: String,
        required: true,
        index: true
    } as any,
    ip_address: {
        type: String,
        required: true
    },
    user_agent: {
        type: String,
        required: true
    },
    accepted_at: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: '__v',
    timestamps: { createdAt: 'accepted_at' }
});

// Ensure a user can only accept a specific version once
UserTermsAcceptanceSchema.index({ user_id: 1, terms_id: 1 }, { unique: true });

TermsAndConditionsSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const TermsAndConditionsModel = mongoose.model<TermsAndConditions & Document>('TermsAndConditions', TermsAndConditionsSchema);
export const UserTermsAcceptanceModel = mongoose.model<UserTermsAcceptance & Document>('UserTermsAcceptance', UserTermsAcceptanceSchema); 
