export type TAlertType = 'info' | 'warning' | 'error';

export type TAlert = {
    id?: string;
    _id?: string;
    user_id: string;
    seen: boolean;
    message: string;
    type: TAlertType;
    created_at?: Date;
    updated_at?: Date;
    __v?: number; // Document version
}