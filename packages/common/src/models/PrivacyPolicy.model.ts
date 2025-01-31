import mongoose, { Schema, Document } from 'mongoose';
import type { PrivacyPolicy } from '@sourcery/common/types/PrivacyPolicy.type';

if (mongoose.models?.PrivacyPolicy) {
    mongoose.deleteModel('PrivacyPolicy');
}

if (mongoose.models?.UserPrivacyPolicyAcceptance) {
    mongoose.deleteModel('UserPrivacyPolicyAcceptance');
}

const PrivacyPolicySchema = new Schema<PrivacyPolicy & Document>({
    version: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

PrivacyPolicySchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const PrivacyPolicyModel = mongoose.model<PrivacyPolicy & Document>('PrivacyPolicy', PrivacyPolicySchema);