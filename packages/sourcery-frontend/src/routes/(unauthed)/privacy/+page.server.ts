import { getActivePrivacyPolicy } from '$lib/classes/privacy';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const policy = await getActivePrivacyPolicy();
    
    if (!policy) {
        throw error(404, 'No active privacy policy found');
    }

    return {
        policy
    };
}; 