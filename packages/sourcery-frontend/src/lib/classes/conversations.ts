import { ConversationModel } from '@sourcery/common/src/models/Conversation.model';
import type { Conversation as ConversationType } from '@sourcery/common/types/Conversation.type';
import { SourceryPub } from '@sourcery/queue/src/pub.js';
import mongoose from 'mongoose';

interface SearchConversation extends ConversationType {
    title: string;
    preview: string;
}

const pub = new SourceryPub(`sourcery.info-ws`);

async function pubConversation(conversation: ConversationType): Promise<void> {
    if (!conversation._id) {
        return;
    }
    const conversation_db = await getConversation(conversation._id);
    pub.addJob(`${conversation_db.project_id}:conversation`, { conversation: conversation_db });
}

function mapDBConversation(conversation: ConversationType): ConversationType {
    return {
        _id: conversation._id?.toString(),
        project_id: conversation.project_id?.toString() || undefined,
        user_id: conversation.user_id?.toString() || undefined,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        description: conversation.description || conversation.messages?.[0]?.content || conversation.created_at?.toLocaleString(),
        messages: conversation.messages?.map(message => {
            return {
                _id: message._id?.toString() || undefined,
                role: message.role,
                content: message.content,
                created_at: message.created_at || new Date(),
                chunks: message.chunks || [],
                files: message.files || []
            };
        }).sort((a, b) => a.created_at.getTime() - b.created_at.getTime()) || [],
    }
}

export async function getConversations(project_id: string): Promise<ConversationType[]> {
    const conversations = await ConversationModel.find({ project_id: project_id.toString(), messages: { $ne: [] } }).sort({ updated_at: -1 });
    return conversations.map(mapDBConversation);
}

export async function getConversation(conversation_id: string): Promise<ConversationType> {
    const conversation = await ConversationModel.findById(conversation_id);
    if (!conversation) {
        throw new Error('Conversation not found');
    }
    return mapDBConversation(conversation);
}

export async function createConversation(conversation: ConversationType): Promise<ConversationType> {
    delete(conversation._id);
    const newConversation = await ConversationModel.create(conversation);
    pubConversation(newConversation);
    return mapDBConversation(newConversation);
}

export async function updateConversation(conversation: ConversationType): Promise<ConversationType> {
    const updatedConversation = await ConversationModel.findByIdAndUpdate(conversation._id, conversation, { new: true });
    if (!updatedConversation) {
        throw new Error('Conversation not found');
    }
    pubConversation(updatedConversation);
    return mapDBConversation(updatedConversation);
}

export async function deleteConversation(conversation_id: string): Promise<void> {
    const deletedConversation = await ConversationModel.findByIdAndDelete(conversation_id);
    if (!deletedConversation) {
        throw new Error('Conversation not found');
    }
    pubConversation(deletedConversation);
}

export async function searchConversations(project_id: string, query: string): Promise<SearchConversation[]> {
    if (!query.trim()) {
        return [];
    }

    const conversations = await ConversationModel.find(
        {
            project_id: new mongoose.Types.ObjectId(project_id),
            $text: { $search: query }
        },
        { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" }, updated_at: -1 })
    .limit(10);

    // Get a preview of the matching message content
    return conversations.map(conversation => {
        const messages = conversation.messages || [];
        const firstQuestion = messages.find(m => m.role === 'user')?.content || '';
        const lastMessage = messages[messages.length - 1];
        const preview = lastMessage ? lastMessage.content : '';
        
        return {
            ...mapDBConversation(conversation),
            title: conversation.description || firstQuestion || 'Untitled conversation',
            preview: preview.substring(0, 100) + (preview.length > 100 ? '...' : '')
        };
    });
}