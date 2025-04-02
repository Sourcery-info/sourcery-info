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
            // Check for duplicate messages by ID or content
            const isDuplicate = conversation.messages?.some(msg => msg._id === message._id || msg.content === message.content);
            if (isDuplicate) return conversation;
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
