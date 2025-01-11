/** @type {import('./$types').LayoutServerLoad} */

import { getAlerts } from '$lib/classes/alerts';
import { error } from '@sveltejs/kit';
import { ORIGIN } from '$env/static/private';
import type { TAlert } from '@sourcery/common/types/Alert.type';

type response = {
    token: string | null,
    alerts: TAlert[] | null,
    origin: string;
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
    let response: response = {
        token: token,
        alerts: alerts,
        origin: ORIGIN
    }
    
    return response;
};
