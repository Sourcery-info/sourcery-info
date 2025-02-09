import mongoose, { Schema, Document } from 'mongoose';
import type { Membership } from '@sourcery/common/types/Membership.type';

if (mongoose.models?.Membership) {
    mongoose.deleteModel('Membership');
}

const MembershipSchema = new Schema<Membership & Document>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    document_limit: {
        type: Number,
        required: true
    },
    page_limit: {
        type: Number,
        required: true
    },
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

export const MembershipModel = mongoose.model('Membership', MembershipSchema); 