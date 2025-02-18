export interface LoginFormData {
    errors?: {
        username?: string;
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        inviteCode?: string;
    };
    data?: {
        username?: string;
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        inviteCode?: string;
    };
    state?: string;
    message?: string;
    userId?: string;
}