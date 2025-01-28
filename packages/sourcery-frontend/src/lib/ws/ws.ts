import { alertsStore } from '$lib/stores/alertsStore';
import { entitiesStore } from '$lib/stores/entities';
import { filesStore } from '$lib/stores/files';
import { conversationsStore } from '$lib/stores/conversations';
import { conversationStore } from '$lib/stores/conversationStore';
import { connect, subscribe } from '@sourcery/ws/src/client.js';
import { usersStore } from '$lib/stores/usersStore';
import type { User } from '@sourcery/common/types/User.type';

interface Project {
    _id: string;
}

let ws_connected = false;

export async function initializeWebSocket(origin: string, token: string, user: User, project: Project | null = null) {
    if (!ws_connected && token) {
        try {
            await connect(`${origin.replace('https://', 'wss://')}`, token);
            ws_connected = true;
        } catch (error) {
            console.error('Error connecting to websocket server', error);
            ws_connected = false;
        }
    }

    await subscribe(`${user.user_id}:alert`, (message) => {
        if (!message.alert?._id) return;
        alertsStore.upsert(message.alert);
    });

    await subscribe(`${user.user_id}:entity`, (message) => {
        if (!message.entity?._id) return;
        if (message.entity.project !== project?._id) return;
        entitiesStore.upsert(message.entity);
    });

    await subscribe(`${user.user_id}:file`, (message) => {
        if (!message.file?._id) return;
        if (message.file.project !== project?._id) return;
        filesStore.upsert(message.file);
    });

    await subscribe(`${user.user_id}:conversation`, (message) => {
        if (!message.conversation?._id) return;
        if (!message.conversation?.messages?.length) return;
        if (message.conversation.project !== project?._id) return;
        conversationsStore.upsert(message.conversation);

        // Update single conversation store if it matches the current conversation
        conversationStore.update((current) => {
            if (current?._id === message.conversation._id) {
                return message.conversation;
            }
            return current;
        });
    });

    await subscribe(`${user.user_id}:user`, (message) => {
        if (!message.user?._id) return;
        usersStore.upsert(message.user);
    });
}