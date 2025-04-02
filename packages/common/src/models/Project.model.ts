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
import type { Project } from '@sourcery/common/types/Project.type';
if (mongoose.models.Project) {
    mongoose.deleteModel('Project');
}

const ProjectSchema = new Schema<Project & Document>({
    name: { 
        type: String, 
        required: true 
    },
    description: String,
    notes: String,
    owner: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    } as any,
    is_public: { 
        type: Boolean, 
        default: false 
    },
    shared_with: [String],
    vector_model: String,
    chat_model: String,
    tags: [String],
    security: String,
    temperature: { 
        type: Number,
        default: 0.1,
        min: 0,
        max: 1
    },
    conversations: [String],
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

ProjectSchema.index({ name: 1, owner: 1 }, { unique: true });

ProjectSchema.pre('save', async function(this: Project & Document) {
    this.updated_at = new Date();
});

export const ProjectModel = mongoose.model<Project & Document>('Project', ProjectSchema);
