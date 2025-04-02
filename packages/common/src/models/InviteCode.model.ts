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
import type { InviteCode } from '@sourcery/common/types/InviteCode.type';

if (mongoose.models.InviteCode) {
    mongoose.deleteModel('InviteCode');
}

const InviteCodeSchema = new Schema<InviteCode & Document>({
    email: { 
        type: String, 
        required: true,
        index: true
    },
    code: { 
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    membership_id: { 
        type: String,
        required: true 
    },
    was_emailed: { 
        type: Boolean, 
        default: false 
    },
    expires_at: { 
        type: Date, 
        required: true 
    },
    used: { 
        type: Boolean, 
        default: false 
    },
    used_at: { 
        type: Date 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
}, {
    versionKey: '__v',
    timestamps: { createdAt: 'createdAt' }
});

InviteCodeSchema.index({ email: 1, code: 1 }, { unique: true });

InviteCodeSchema.pre('save', function(next) {
    if (this.used && !this.used_at) {
        this.used_at = new Date();
    }
    next();
});

export const InviteCodeModel = mongoose.model<InviteCode & Document>('InviteCode', InviteCodeSchema); 