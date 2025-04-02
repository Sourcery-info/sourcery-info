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