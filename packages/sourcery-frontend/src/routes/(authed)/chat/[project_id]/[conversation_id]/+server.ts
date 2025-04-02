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