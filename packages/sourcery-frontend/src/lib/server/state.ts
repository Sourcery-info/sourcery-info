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

import type { RequestEvent } from '@sveltejs/kit';
import { validateSessionToken } from './auth';
import { getUser } from '../classes/users';

export async function getState(event: RequestEvent) {
    const token = event.cookies.get("session") ?? null;
    if (!token) {
        return {
            state: 'no-token'
        };
    }

    const session = await validateSessionToken(token);
    if (!session) {
        return {
            state: 'invalid-session'
        };
    }

    const user = await getUser(session.user_id);
    if (!user) {
        return {
            state: 'invalid-session'
        };
    }

    return {
        session,
        user,
        state: 'valid-session'
    };
} 