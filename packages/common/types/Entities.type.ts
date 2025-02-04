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
    vector?: number[];
    aliases?: string[];
    created_at?: Date;
    updated_at?: Date;
    __v?: number; // Document version
}