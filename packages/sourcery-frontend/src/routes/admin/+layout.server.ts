/** @type {import('./$types').LayoutServerLoad} */

import { getAlerts } from '$lib/classes/alerts';
import { error } from '@sveltejs/kit';
import { ORIGIN } from '$env/static/private';
import type { TAlert } from '@sourcery/common/types/Alert.type';
import type { User } from '@sourcery/common/types/User.type';
import { getUsers } from '$lib/classes/users';
import type { Session } from '$lib/server/auth';

type response = {
    token: string | null,
    alerts: TAlert[] | null,
    users: User[] | null,
    origin: string;
    user: User | null;
    session: Session | null;
}

export async function load({ params, locals, cookies }): Promise<response> {
    if (!locals?.session?.user_id) {
        return error(401, 'Unauthorized');
    }
    // if (!locals?.user?.admin) {
    //     return error(403, 'Forbidden');
    // }
    const token = cookies.get("session") ?? null;

    const alerts = await getAlerts(locals.session.user_id);
    const users = await getUsers();
    let response: response = {
        token: token,
        alerts: alerts,
        users: users,
        origin: ORIGIN,
        user: locals?.user,
        session: locals?.session
    }
    
    return response;
};
