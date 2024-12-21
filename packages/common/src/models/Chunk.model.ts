import mongoose, { Schema, Document } from 'mongoose';
import { TChunk } from '@sourcery/common/types/Chunks.type';

if (mongoose.models.Chunk) {
    mongoose.deleteModel('Chunk');
}

const ChunkSchema = new Schema<TChunk & Document>({
    _id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    id: {
        type: String,
        index: true
    },
    title: String,
    level: Number,
    content: String,
    parent: [{ type: Schema.Types.ObjectId, ref: 'Chunk', index: true }],
    context: String,
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

ChunkSchema.pre('save', function(this: TChunk & Document, next) {
    this.updated_at = new Date();
    next();
});

export const ChunkModel = mongoose.model<TChunk & Document>('Chunk', ChunkSchema);
