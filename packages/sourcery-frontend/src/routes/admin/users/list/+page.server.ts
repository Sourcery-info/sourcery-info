/** @type {import('.$types').PageServerLoad} */

import { getUserCount, getUsers } from '$lib/classes/users';
export async function load() {
    const userCount = await getUserCount();
    const users = await getUsers();
    return {
        userCount,
        users
    };
};