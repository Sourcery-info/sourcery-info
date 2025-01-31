import mongoose, { Schema, Document } from 'mongoose';
import type { Conversation } from '@sourcery/common/types/Conversation.type';
import type { Message } from '@sourcery/common/types/Message.type';
import { TChunk } from '@sourcery/common/types/Chunks.type';
if (mongoose.models.Conversation) {
    mongoose.deleteModel('Conversation');
}

const ChunkSchema = new Schema<TChunk & Document>({
    title: String,
    level: Number,
    content: String,
    parent: String,
    context: String
});

const MessageSchema = new Schema<Message & Document>({
    _id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    role: String,
    content: String,
    file_ids: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    chunk_ids: [{ type: Schema.Types.ObjectId, ref: 'Chunk' }],
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

const ConversationSchema = new Schema<Conversation & Document>({
    description: String,
    project_id: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        index: true
    } as any,
    messages: [MessageSchema],
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    } as any,
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

ConversationSchema.pre('save', function(this: Conversation & Document, next) {
    this.updated_at = new Date();
    next();
});

// Add text index for search
ConversationSchema.index(
    { 
        description: 'text',
        'messages.content': 'text'
    },
    {
        weights: {
            description: 10,           // Highest priority
            'messages.content': 5      // Second priority
        },
        name: "conversation_text_index"
    }
);

export const ConversationModel = mongoose.model<Conversation & Document>('Conversation', ConversationSchema);
