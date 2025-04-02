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

import { writable } from 'svelte/store';
import type { User } from '@sourcery/common/types/User.type';

function createUsersStore() {
    const { subscribe, set, update } = writable<User[]>([]);

    return {
        subscribe,
        set,
        update,
        // Add a user
        add: (user: User) => update(users => [...users, user]),
        // Remove a user
        remove: (userId: string) => update(users => users.filter(u => u._id !== userId)),
        // Update a user
        updateOne: (userId: string, data: Partial<User>) => update(users => 
            users.map(u => {
                if (u._id === userId) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = u.__v ?? 0;
                    const newVersion = data.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        return { ...u, ...data };
                    }
                    return u;
                }
                return u;
            })
        ),
        upsert: (user: User) => {
            update(users => {
                const index = users.findIndex(u => u._id === user._id);
                if (index !== -1) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = users[index].__v ?? 0;
                    const newVersion = user.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        users[index] = { ...users[index], ...user };
                    }
                } else {
                    users.push(user);
                }
                return users;
            });
        },
        // Reset store
        reset: () => set([])
    };
}

export const usersStore = createUsersStore(); 