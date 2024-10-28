 export type User = {
    _id: string;
    email: string;
    name: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
    settings?: UserSettings;
}

export type UserSettings = {
    theme?: string;
    language?: string;
    notifications?: boolean;
    default_vector_model?: string;
    default_chat_model?: string;
    [key: string]: any;
}