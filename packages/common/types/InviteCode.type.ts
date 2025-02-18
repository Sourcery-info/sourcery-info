export interface InviteCode {
    _id: string;
    email: string;
    code: string;
    membership_id: string;
    was_emailed: boolean;
    expires_at: Date;
    used: boolean;
    used_at?: Date;
    created_at: Date;
}

export interface CreateInviteCodeInput {
    email: string;
    membership_id: string;
    send_email: boolean;
} 