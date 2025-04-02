// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
