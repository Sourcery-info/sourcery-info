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
});

ProjectSchema.index({ name: 1, owner: 1 }, { unique: true });

ProjectSchema.pre('save', async function(this: Project & Document) {
    this.updated_at = new Date();
});

export const ProjectModel = mongoose.model<Project & Document>('Project', ProjectSchema);
