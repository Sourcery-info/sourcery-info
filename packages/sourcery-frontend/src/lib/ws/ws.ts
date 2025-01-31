import { alertsStore } from '$lib/stores/alerts.store';
import { entitiesStore } from '$lib/stores/entities.store';
import { filesStore } from '$lib/stores/files.store';
import { conversationsStore } from '$lib/stores/conversations.store';
import { conversationStore } from '$lib/stores/conversation.store';
import { usersStore } from '$lib/stores/users.store';
import { cleanup, connect, subscribe } from '@sourcery/ws/src/client.js';
import type { User } from '@sourcery/common/types/User.type';
import { projectsStore } from '$lib/stores/projects.store';

interface Project {
    _id: string;
}

export async function initializeWebSocket(origin: string, token: string, user: User, project: Project | null = null) {
    if (!token) return;
    
    try {
        await connect(`${origin.replace('https://', 'wss://')}`, token);
        
        await subscribe(`${user.user_id}:alert`, (message) => {
            if (!message.alert?._id) return;
            alertsStore.upsert(message.alert);
        });

        await subscribe(`${user.user_id}:entity`, (message) => {
            if (!message.entity?._id) return;
            // if (message.entity.project !== project?._id) return;
            entitiesStore.upsert(message.entity);
        });

        await subscribe(`${user.user_id}:file`, (message) => {
            if (!message.file?._id) return;
            // if (message.file.project !== project?._id) return;
            console.log('message', message);
            filesStore.upsert(message.file);
        });

        await subscribe(`${user.user_id}:file-deleted`, (message) => {
            if (!message.id) return;
            // if (message.file.project !== project?._id) return;
            console.log('message', message);
            filesStore.remove(message.id);
        });

        await subscribe(`${user.user_id}:conversation`, (message) => {
            if (!message.conversation?._id) return;
            if (!message.conversation?.messages?.length) return;
            // if (message.conversation.project !== project?._id) return;
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

        await subscribe(`${user.user_id}:project`, (message) => {
            if (!message.project?._id) return;
            projectsStore.upsert(message.project);
        });

        await subscribe(`${user.user_id}:project-deleted`, (message) => {
            if (!message.project_id) return;
            projectsStore.remove(message.project_id);
        });

    } catch (error) {
        console.error('Error connecting to websocket server', error);
    }
}

export async function cleanupWebSocket() {
    await cleanup();
}