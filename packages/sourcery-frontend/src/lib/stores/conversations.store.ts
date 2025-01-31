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