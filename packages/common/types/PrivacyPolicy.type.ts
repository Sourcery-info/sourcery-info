export interface PrivacyPolicy {
    _id?: string;
    version: string;
    content: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}