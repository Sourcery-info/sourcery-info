import mongoose from 'mongoose';

export interface Entity {
    _id?: string;
    id?: string;
    chunk_ids: (string | mongoose.Types.ObjectId)[];
    file_ids?: (string | mongoose.Types.ObjectId)[];
    project_id: string | mongoose.Types.ObjectId;
    type: string;
    value: string;
    description?: string;
    aliases?: string[];
    created_at?: Date;
    updated_at?: Date;
}