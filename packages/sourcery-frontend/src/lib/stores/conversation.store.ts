import { writable } from 'svelte/store';
import type { Conversation } from '@sourcery/common/types/Conversation.type';
import type { Message } from '@sourcery/common/types/Message.type';

function createConversationStore() {
    const { subscribe, set, update } = writable<Conversation | null>(null);

    return {
        subscribe,
        set,
        update,
        // Update conversation data
        updateData: (data: Partial<Conversation>) => update(conversation => 
            conversation ? { ...conversation, ...data } : null
        ),
        // Add a new message to the conversation
        addMessage: (message: Message) => update(conversation => {
            if (!conversation) return null;
            return {
                ...conversation,
                messages: [...(conversation.messages || []), message]
            };
        }),
        // Update a specific message in the conversation
        updateMessage: (messageId: string, data: Partial<Message>) => update(conversation => {
            if (!conversation?.messages) return conversation;
            return {
                ...conversation,
                messages: conversation.messages.map(msg => 
                    msg._id === messageId ? { ...msg, ...data } : msg
                )
            };
        }),
        // Reset store
        reset: () => set(null)
    };
}

export const conversationStore = createConversationStore();
