import type { SourceryFile } from './SourceryFile.type';

export type Project = {
    _id: string;
    urlid: string | null;
    name: string;
    description?: string;
    notes?: string;
    owner: string;
    is_public: boolean;
    shared_with?: string[];
    created_at: Date | null;
    updated_at: Date | null;
    vector_model: string;
    chat_model: string;
    temperature: number;
    tags?: string;
    security: string;
    conversations?: string[];
    files?: SourceryFile[];
}