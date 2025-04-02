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
import type { TAlert, TAlertType } from '@sourcery/common/types/Alert.type';

if (mongoose.models.Alert) {
    mongoose.deleteModel('Alert');
}

const AlertSchema = new Schema<TAlert & Document>({
    user_id: {
        type: String,
        required: true,
        index: true
    },
    seen: {
        type: Boolean,
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['info', 'warning', 'error']
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
}, {
    versionKey: '__v',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

AlertSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const AlertModel = mongoose.model<TAlert & Document>('Alert', AlertSchema);
