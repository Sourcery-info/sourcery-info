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
import type { Conversation } from '@sourcery/common/types/Conversation.type';

function createConversationsStore() {
    const { subscribe, set, update } = writable<Conversation[]>([]);

    return {
        subscribe,
        set,
        update,
        // Add a conversation
        add: (conversation: Conversation) => update(conversations => [...conversations, conversation]),
        // Remove a conversation
        remove: (conversationId: string) => update(conversations => conversations.filter(c => c._id !== conversationId)),
        // Update a conversation
        updateOne: (conversationId: string, data: Partial<Conversation>) => update(conversations => 
            conversations.map(c => {
                if (c._id === conversationId) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = c.__v ?? 0;
                    const newVersion = data.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        return { ...c, ...data };
                    }
                    return c;
                }
                return c;
            })
        ),
        upsert: (conversation: Conversation) => {
            update(conversations => {
                const index = conversations.findIndex(c => c._id === conversation._id);
                if (index !== -1) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = conversations[index].__v ?? 0;
                    const newVersion = conversation.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        conversations[index] = { ...conversations[index], ...conversation };
                    }
                } else {
                    conversations.unshift(conversation);
                }
                return conversations;
            });
        },
        // Reset store
        reset: () => set([])
    };
}

export const conversationsStore = createConversationsStore(); 