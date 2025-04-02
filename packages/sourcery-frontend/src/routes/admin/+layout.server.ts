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

/** @type {import('./$types').LayoutServerLoad} */

import { getAlerts } from '$lib/classes/alerts';
import { error } from '@sveltejs/kit';
import { ORIGIN } from '$env/static/private';
import type { TAlert } from '@sourcery/common/types/Alert.type';
import type { User } from '@sourcery/common/types/User.type';
import { getUsers } from '$lib/classes/users';
import type { Session } from '$lib/server/auth';

type response = {
    token: string | null,
    alerts: TAlert[] | null,
    users: User[] | null,
    origin: string;
    user: User | null;
    session: Session | null;
}

export async function load({ params, locals, cookies }): Promise<response> {
    if (!locals?.session?.user_id) {
        return error(401, 'Unauthorized');
    }
    // if (!locals?.user?.admin) {
    //     return error(403, 'Forbidden');
    // }
    const token = cookies.get("session") ?? null;

    const alerts = await getAlerts(locals.session.user_id);
    const users = await getUsers();
    let response: response = {
        token: token,
        alerts: alerts,
        users: users,
        origin: ORIGIN,
        user: locals?.user,
        session: locals?.session
    }
    
    return response;
};
