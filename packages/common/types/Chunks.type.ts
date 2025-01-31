import type { Entity } from "./Entities.type";

// Define type for chunk
export type TChunk = {
    id?: string;
    _id?: string;
    file_id?: string;
    title: string;
    level: number;
    content: string;
    parent: string | null;
    children: TChunk[] | null;
    vector?: number[];
    context?: string;
    created_at?: Date;
    updated_at?: Date;
    tokens?: number;
    entities?: Entity[];
    __v?: number; // Document version
}