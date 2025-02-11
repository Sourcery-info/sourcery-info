import type { Membership } from './Membership.type';

export type User = {
    _id: string;
    user_id?: string;
    email: string;
    name: string;
    username: string;
    password_hash: string;
    password?: string;
    created_at: Date;
    updated_at: Date;
    approved: boolean;
    admin: boolean;
    settings?: UserSettings;
    membership_id?: Array<string>;
    memberships?: Array<Membership>;
    __v?: number; // Document version
}

export type UserSettings = {
    theme?: string;
    language?: string;
    notifications?: boolean;
    default_vector_model?: string;
    default_chat_model?: string;
    [key: string]: any;
}