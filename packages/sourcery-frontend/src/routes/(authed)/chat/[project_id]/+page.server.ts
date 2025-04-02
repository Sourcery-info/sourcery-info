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

/** @type {import('./$types').PageServerLoad} */
// import { randomUUID } from 'node:crypto';
import { redirect } from '@sveltejs/kit';
import { createConversation } from '$lib/classes/conversations';
import { logger } from '@sourcery/common/src/logger';

export async function load({ params, locals }) {
    if (!locals?.session?.user_id) {
        return redirect(307, '/login');
    }
    const conversation = await createConversation({ user_id: locals?.session?.user_id, project_id: params.project_id, messages: [], created_at: new Date(), updated_at: new Date() });
    logger.info({ msg: 'Created conversation', conversation_id: conversation._id, tags: ['chat', 'info'] });
    redirect(307, `/chat/${params.project_id}/${conversation._id}`);
};

export const actions = {
}
