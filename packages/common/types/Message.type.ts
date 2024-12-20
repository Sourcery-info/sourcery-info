export type Message = {
    _id?: string;
    role: string;
    content: string;
    files?: string[];
    chunks?: string[];
    created_at?: Date;
    updated_at?: Date;
}
