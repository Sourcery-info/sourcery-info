import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { acceptTerms } from '$lib/classes/terms';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const clientIp = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        await acceptTerms(locals.user.user_id, clientIp, userAgent);
        
        return json({ success: true });
    } catch (error) {
        console.error('Error accepting terms:', error);
        return json({ error: 'Failed to accept Terms & Conditions' }, { status: 500 });
    }
}; 
