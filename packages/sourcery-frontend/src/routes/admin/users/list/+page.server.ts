/** @type {import('./$types').PageServerLoad} */

import { getUserCount, getUsers } from '$lib/classes/users';
import { getUserTermsAcceptanceHistory } from '$lib/classes/terms';

export async function load() {
    const userCount = await getUserCount();
    const users = await getUsers();
    console.log(users);
    
    // Get terms acceptance for each user
    const usersWithTerms = await Promise.all(users.map(async (user) => {
        if (!user._id) return user;
        const acceptanceHistory = await getUserTermsAcceptanceHistory(user._id);
        const latestAcceptance = acceptanceHistory[0]; // Already sorted by accepted_at desc
        return {
            ...user,
            latestTermsAcceptance: latestAcceptance || null
        };
    }));

    return {
        userCount,
        users: usersWithTerms
    };
};