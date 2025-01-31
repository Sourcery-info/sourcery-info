import mongoose, { Schema, Document } from 'mongoose';
import type { TAlert, TAlertType } from '@sourcery/common/types/Alert.type';

if (mongoose.models.Alert) {
    mongoose.deleteModel('Alert');
}

const AlertSchema = new Schema<TAlert & Document>({
    user_id: {
        type: String,
        required: true,
        index: true
    },
    seen: {
        type: Boolean,
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['info', 'warning', 'error']
    },
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

AlertSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const AlertModel = mongoose.model<TAlert & Document>('Alert', AlertSchema);
