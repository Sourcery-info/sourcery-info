import mongoose, { Schema, Document } from 'mongoose';
import type { Project } from '@sourcery/common/types/Project.type';

const ProjectSchema = new Schema<Project & Document>({
    urlid: { 
        type: String, 
        required: true, 
        unique: true 
    },
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
    },
    is_public: { 
        type: Boolean, 
        default: false 
    },
    shared_with: [String],
    vector_model: String,
    chat_model: String,
    tags: [String],
    security: String,
    conversations: [String],
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
});

ProjectSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const ProjectModel = mongoose.model<Project & Document>('Project', ProjectSchema);
