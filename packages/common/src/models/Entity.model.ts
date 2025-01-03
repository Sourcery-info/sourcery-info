import mongoose, { Schema, Document } from 'mongoose';
import { Entity } from '@sourcery/common/types/Entities.type';

if (mongoose.models.Entity) {
    mongoose.deleteModel('Entity');
}

const EntitySchema = new Schema<Entity & Document>({
    id: {
        type: String,
        index: true
    },
    chunk_ids: [{ type: Schema.Types.ObjectId, ref: 'Chunk', index: true }],
    project_id: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    type: {
        type: String,
        required: true,
        index: true
    },
    value: {
        type: String,
        required: true
    },
    description: String,
    aliases: [String],
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
});

EntitySchema.pre('save', function(this: Entity & Document, next) {
    this.updated_at = new Date();
    next();
});

EntitySchema.index({ type: 1, value: 1, project_id: 1 }, { unique: true });

export const EntityModel = mongoose.model<Entity & Document>('Entity', EntitySchema);
