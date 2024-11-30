export type Message = {
    role: string;
    content: string;
    files?: string[];
    created_at?: Date;
    updated_at?: Date;
}
