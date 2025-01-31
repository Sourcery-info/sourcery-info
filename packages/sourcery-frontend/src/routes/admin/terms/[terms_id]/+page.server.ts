import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { getTermsById, updateTerms } from '$lib/classes/terms';
import { zfd } from "zod-form-data";
import { incrementVersion } from '$lib/utils/versions';

export const load: PageServerLoad = async ({ params }) => {
    const terms = await getTermsById(params.terms_id);
    if (!terms) {
        throw error(404, 'Terms & Conditions not found');
    }
    const nextVersion = incrementVersion(terms.version, 'patch');
    return { terms, nextVersion };
};

const termsSchema = zfd.formData({
    version: zfd.text(z.string().min(1, 'Version is required')),
    content: zfd.text(z.string().min(1, 'Content is required')),
    active: zfd.checkbox({trueValue: "1"})
});

export const actions = {
    default: async ({ request, params }) => {
        const terms = await getTermsById(params.terms_id);
        if (!terms) {
            return fail(404, { errors: { server: ['Terms & Conditions not found'] } });
        }

        try {
            const result = await termsSchema.parse(await request.formData());
            console.log(result);
            await updateTerms({
                ...terms,
                ...result
            });
            return {
                success: true,
                message: 'Terms & Conditions updated successfully'
            };
        } catch (error) {
            const nextVersion = incrementVersion(terms.version, 'patch');
            if (error instanceof z.ZodError) {
                return fail(400, {
                    data: { ...terms, nextVersion },
                    errors: error.flatten().fieldErrors
                });
            }
            console.error('Error updating terms:', error);
            return fail(500, {
                data: { ...terms, nextVersion },
                errors: { server: ['Failed to update Terms & Conditions'] }
            });
        }
    }
}; 
