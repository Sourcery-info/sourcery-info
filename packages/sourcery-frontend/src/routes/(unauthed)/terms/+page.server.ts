import { getActiveTerms } from '$lib/classes/terms';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const terms = await getActiveTerms();
    
    if (!terms) {
        throw error(404, 'No active terms and conditions found');
    }

    return {
        terms
    };
}; 