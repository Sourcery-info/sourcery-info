export type TermsAndConditions = {
    _id?: string;
    version: string;
    content: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

export type UserTermsAcceptance = {
    _id?: string;
    user_id: string;
    terms_id: string;
    version: string;
    ip_address: string;
    user_agent: string;
    accepted_at: Date;
} 