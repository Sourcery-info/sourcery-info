/** @type {import('./$types').PageServerLoad} */
import { getEntities } from '$lib/classes/entities';
export async function load({ params }) {
    const entities = await getEntities(params.project_id);
    return { entities };
};