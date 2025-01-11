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
            users.map(u => u._id === userId ? { ...u, ...data } : u)
        ),
        upsert: (user: User) => {
            update(users => {
                const index = users.findIndex(u => u._id === user._id);
                if (index !== -1) {
                    users[index] = { ...users[index], ...user };
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