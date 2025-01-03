export type LoginFormData = {
    data?: {
        username?: string;
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    };
    errors?: {
        username?: string;
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    };
    state?: string;
    message?: string;
};