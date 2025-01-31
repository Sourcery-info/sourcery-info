import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TermsAndConditionsModel } from '@sourcery/common/src/models/TermsAndConditions.model';

export const load: PageServerLoad = async () => {
    try {
        const terms = await TermsAndConditionsModel.find()
            .sort({ created_at: -1 })
            .lean();

        return {
            terms: terms.map(term => ({
                _id: term._id.toString(),
                version: term.version,
                content: term.content,
                active: term.active,
                created_at: term.created_at,
                updated_at: term.updated_at
            }))
        };
    } catch (err) {
        console.error('Error loading terms:', err);
        throw error(500, 'Error loading Terms & Conditions');
    }
}; 