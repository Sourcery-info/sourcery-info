import { ConversationModel } from '@sourcery/common/src/models/Conversation.model';
import type { Conversation as ConversationType } from '@sourcery/common/types/Conversation.type';

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
                role: message.role,
                content: message.content,
                created_at: message.created_at || new Date()
            };
        }).sort((a, b) => a.created_at.getTime() - b.created_at.getTime()) || [],
    }
}

export async function getConversations(project_id: string): Promise<ConversationType[]> {
    const conversations = await ConversationModel.find({ project_id: project_id.toString() });
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
    console.log(newConversation);
    return mapDBConversation(newConversation);
}

export async function updateConversation(conversation: ConversationType): Promise<ConversationType> {
    const updatedConversation = await ConversationModel.findByIdAndUpdate(conversation._id, conversation, { new: true });
    if (!updatedConversation) {
        throw new Error('Conversation not found');
    }
    return mapDBConversation(updatedConversation);
}

export async function deleteConversation(conversation_id: string): Promise<void> {
    const deletedConversation = await ConversationModel.findByIdAndDelete(conversation_id);
    if (!deletedConversation) {
        throw new Error('Conversation not found');
    }
}