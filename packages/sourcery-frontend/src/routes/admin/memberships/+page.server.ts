import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllMemberships } from '$lib/classes/memberships';

export const load: PageServerLoad = async () => {
    try {
        const memberships = await getAllMemberships();
        return { memberships };
    } catch (err) {
        console.error('Error loading memberships:', err);
        throw error(500, 'Failed to load memberships');
    }
};