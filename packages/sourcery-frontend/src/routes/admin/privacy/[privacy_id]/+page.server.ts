import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { getPrivacyPolicyById, updatePrivacyPolicy } from '$lib/classes/privacy';
import { zfd } from "zod-form-data";
import { incrementVersion } from '$lib/utils/versions';

export const load: PageServerLoad = async ({ params }) => {
    const policy = await getPrivacyPolicyById(params.privacy_id);
    if (!policy) {
        throw error(404, 'Privacy Policy not found');
    }
    const nextVersion = incrementVersion(policy.version, 'patch');
    return { policy, nextVersion };
};

const privacyPolicySchema = zfd.formData({
    version: zfd.text(z.string().min(1, 'Version is required')),
    content: zfd.text(z.string().min(1, 'Content is required')),
    active: zfd.checkbox({trueValue: "1"})
});

export const actions = {
    default: async ({ request, params }) => {
        const policy = await getPrivacyPolicyById(params.privacy_id);
        if (!policy) {
            return fail(404, { errors: { server: ['Privacy Policy not found'] } });
        }

        try {
            const result = await privacyPolicySchema.parse(await request.formData());
            console.log(result);
            await updatePrivacyPolicy({
                ...policy,
                ...result
            });
            return {
                success: true,
                message: 'Privacy Policy updated successfully'
            };
        } catch (error) {
            const nextVersion = incrementVersion(policy.version, 'patch');
            if (error instanceof z.ZodError) {
                return fail(400, {
                    data: { ...policy, nextVersion },
                    errors: error.flatten().fieldErrors
                });
            }
            console.error('Error updating privacy policy:', error);
            return fail(500, {
                data: { ...policy, nextVersion },
                errors: { server: ['Failed to update Privacy Policy'] }
            });
        }
    }
}; 
