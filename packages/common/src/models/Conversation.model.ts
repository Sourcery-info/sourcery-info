import mongoose, { Schema, Document } from 'mongoose';
import type { Conversation } from '@sourcery/common/types/Conversation.type';
import type { Message } from '@sourcery/common/types/Message.type';
if (mongoose.models.Conversation) {
    mongoose.deleteModel('Conversation');
}

const MessageSchema = new Schema<Message & Document>({
    role: String,
    content: String,
    files: [{ type: Schema.Types.ObjectId, ref: 'File' }],
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
});

ConversationSchema.pre('save', function(this: Conversation & Document, next) {
    this.updated_at = new Date();
    next();
});

export const ConversationModel = mongoose.model<Conversation & Document>('Conversation', ConversationSchema);
