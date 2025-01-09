/** @type {import('./$types').RequestHandler} */
import fetch from 'node-fetch';
import { getConversation, updateConversation } from '$lib/classes/conversations';
import { getChunk } from '$lib/classes/chunks';
import type { TChunk } from '@sourcery/common/types/Chunks.type';

interface ChatResponse {
    conversation_id: string;
    message: {
        role: string;
        content: string;
        chunk_ids?: string[];
        chunks?: TChunk[];
    };
}

export async function POST({ params, request }) {
    const { project_id, conversation_id } = params;
    const { input } = await request.json();
    const messages = [{ role: 'user', content: input }];
    const conversation = await getConversation(conversation_id);
    if (!conversation) {
        return new Response("Conversation not found", {
            status: 404
        });
    }
    messages.push(...conversation.messages || []);
    const savedConversation = await updateConversation({ _id: conversation_id, messages });
    if (!savedConversation.messages) {
        return new Response("Error", {
            status: 500
        });
    }
    const message_id = savedConversation.messages[savedConversation.messages.length - 1]._id;

    const response = await fetch(`http://localhost:9101/chat/${project_id}`, {
        method: 'POST',
        body: JSON.stringify({ input, conversation_id, message_id }),
        headers: { 
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        return new Response("Error", {
            status: 500
        });
    }

    try {
        const response_data = await response.json() as ChatResponse;
        if (response_data?.message) {
            // Fetch full chunk data if there are chunk_ids
            const chunkIds = response_data.message.chunk_ids || [];
            if (chunkIds.length > 0) {
                const chunks = await Promise.all(
                    chunkIds.map((id: string) => getChunk(id))
                );
                response_data.message.chunks = chunks.filter((c): c is TChunk => c !== null);
            }
            return new Response(JSON.stringify(response_data), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            throw new Error('No message in response');
        }
    } catch (error) {
        console.error('Error reading response', error);
        return new Response("Error processing response", {
            status: 500
        });
    }
}