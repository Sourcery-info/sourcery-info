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
}, {
    versionKey: '__v',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

ConfigSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const ConfigModel = mongoose.model<Config & Document>('Config', ConfigSchema); 