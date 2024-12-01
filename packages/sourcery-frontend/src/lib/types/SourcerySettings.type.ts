export enum SourcerySecurity {
    SECURE = 'secure',
    INSECURE = 'insecure'
}

export type SourceryAccount = {
    user_id: string;
    username: string;
    name: string;
    email: string;
    password: string;
    otp: string | null;
    admin: boolean;
    approved: boolean;
    date_created: string | null;
    last_login: string | null;
    avatar: string | null;
}

export type SourcerySettings = {
    vector_model: string;
    chat_model: string;
    temperature: number;
    security: SourcerySecurity;
    accounts: SourceryAccount[];
}