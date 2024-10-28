import { writable } from 'svelte/store';
import { Settings } from '$lib/classes/settings';
import bcrypt from 'bcryptjs';
import { authenticator } from '@otplib/preset-default';
import type { SourceryAccount } from '$lib/types/SourcerySettings.type';
const settings = new Settings();

// Add this type definition
type AuthState = {
    isAuthenticated: boolean;
    user: SourceryAccount | null;
};

// Update the store initialization
export const authStore = writable<AuthState>({
    isAuthenticated: false,
    user: null,
});

export async function login(username: string, password: string) {
    const s = settings.get();
    const account = s.accounts.find(u => u.username === username);

    if (account && await bcrypt.compare(password, account.password)) {
        account.last_login = new Date().toISOString();
        settings.set(s);
        authStore.set({ isAuthenticated: true, user: account });
        return true;
    }
    return false;
}

export async function createAccount(username: string, password: string, otpSecret: string) {
    const s = settings.get();
    const isFirstUser = s.accounts.length === 0;

    const newUser = {
        username,
        password: await bcrypt.hash(password, 10),
        admin: isFirstUser,
        approved: isFirstUser,
        date_created: new Date().toISOString(),
        last_login: new Date().toISOString(),
        otpSecret,
    };

    s.accounts.push(newUser);
    settings.set(s);

    if (isFirstUser) {
        authStore.set({ isAuthenticated: true, user: newUser });
    }

    return isFirstUser;
}

export function logout() {
    authStore.set({ isAuthenticated: false, user: null });
}

export function verifyOTP(token: string, secret: string) {
    return authenticator.verify({ token, secret });
}
