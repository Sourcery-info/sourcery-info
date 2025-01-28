import type { RequestEvent } from '@sveltejs/kit';
import { validateSessionToken } from './auth';
import { getUser } from '../classes/users';

export async function getState(event: RequestEvent) {
    const token = event.cookies.get("session") ?? null;
    if (!token) {
        return {
            state: 'no-token'
        };
    }

    const session = await validateSessionToken(token);
    if (!session) {
        return {
            state: 'invalid-session'
        };
    }

    const user = await getUser(session.user_id);
    if (!user) {
        return {
            state: 'invalid-session'
        };
    }

    return {
        session,
        user,
        state: 'valid-session'
    };
} 