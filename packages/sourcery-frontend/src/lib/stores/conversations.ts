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
            conversations.map(c => c._id === conversationId ? { ...c, ...data } : c)
        ),
        upsert: (conversation: Conversation) => {
            update(conversations => {
                const index = conversations.findIndex(c => c._id === conversation._id);
                if (index !== -1) {
                    conversations[index] = { ...conversations[index], ...conversation };
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