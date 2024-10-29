/** @type {import('./$types').PageServerLoad} */

import { getUserCount, getUsers } from '$lib/server/user';
import { fail } from '@sveltejs/kit';
export async function load({ locals }) {
    // if (!locals?.user?.admin) {
    //     fail(403, { message: 'Unauthorized' });
    // }
    const userCount = await getUserCount();
    const users = await getUsers();
    return {
        userCount,
        users
    };
};