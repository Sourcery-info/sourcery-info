import mongoose from "mongoose";
import { TChunk } from "./Chunks.type";
import { SourceryFile } from "./SourceryFile.type";

export type Message = {
    _id?: string;
    role: string;
    content: string;
    file_ids?: string[] | mongoose.Schema.Types.ObjectId[];
    chunk_ids?: string[] | mongoose.Schema.Types.ObjectId[];
    chunks?: TChunk[];
    files?: SourceryFile[];
    created_at?: Date;
    updated_at?: Date;
    error?: boolean;
    failedQuery?: string;
    __v?: number;
}
