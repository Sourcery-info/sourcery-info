import type { PageServerLoad } from './$types';
import { getAlerts } from '$lib/classes/alerts';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.session?.user_id) {
        return { alerts: [] };
    }
	const alerts = await getAlerts(locals.session?.user_id);
    console.log(alerts);
	return { alerts };
}; 