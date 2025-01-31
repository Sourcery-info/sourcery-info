import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllPrivacyPolicyVersions } from '$lib/classes/privacy';

export const load: PageServerLoad = async () => {
    try {
        const policies = await getAllPrivacyPolicyVersions();
        return {
            policies: policies
        };
    } catch (err) {
        console.error('Error loading privacy policies:', err);
        throw error(500, 'Error loading Privacy Policies');
    }
}; 