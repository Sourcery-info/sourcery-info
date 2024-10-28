export interface LoginFormData {
data?: {
    username?: string;
        password?: string;
        confirmPassword?: string;
    };
    errors?: {
        username?: string;
        password?: string;
        confirmPassword?: string;
    };
    state?: string;
    message?: string;
}