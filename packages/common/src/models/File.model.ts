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
import type { SourceryFile, StageLog } from '@sourcery/common/types/SourceryFile.type';
import { FileTypes, FileStage, FileStatus, StageState, StageResult } from '@sourcery/common/types/SourceryFile.type';
if (mongoose.models.File) {
    mongoose.deleteModel('File');
}

// const StageLogSchema = new Schema<StageLog>({
//     stage: String,
//     input: Schema.Types.Mixed,
//     state: { type: String, enum: StageState },
//     result: { type: String, enum: StageResult },
//     message: String,
//     start_time: Date,
//     end_time: Date,
//     duration: Number,
//     filename: String,
// });

const FileSchema = new Schema<SourceryFile & Document>({
    original_name: String,
    filename: String,
    metadata: String,
    filetype: { type: String, enum: FileTypes },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        index: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    status: { type: String, enum: FileStatus, index: true },
    stage: { type: String, enum: FileStage, index: true },
    stage_queue: { type: [String], default: [] },
    stage_paths: { type: Object, default: {} },
    completed_stages: { type: [String], default: [] },
    last_filename: String,
    processing: { type: Boolean, default: false, index: true },
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

FileSchema.pre('save', function(this: SourceryFile & Document, next) {
    this.updated_at = new Date();
    next();
});

// Add text index for search
FileSchema.index(
    { 
        original_name: 'text',
        filename: 'text',
        metadata: 'text'
    },
    {
        weights: {
            original_name: 10,    // Highest priority
            filename: 5,          // Second priority
            metadata: 1           // Lowest priority
        },
        name: "file_text_index"
    }
);

export const FileModel = mongoose.model<SourceryFile & Document>('File', FileSchema);
