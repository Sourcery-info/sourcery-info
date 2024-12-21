/** @type {import('./$types').RequestHandler} */
import fetch from 'node-fetch';
import { Readable } from "node:stream";
import { getConversation, updateConversation } from '$lib/classes/conversations';

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
    // console.log(savedConversation);
    if (!savedConversation.messages) {
        return new Response("Error", {
            status: 500
        });
    }
    const message_id = savedConversation.messages[savedConversation.messages.length - 1]._id;
    const buffer: Buffer[] = [];
    // console.log(JSON.stringify({ input, conversation }));
    // console.log(`http://localhost:9101/chat/${project_id}`);
    const response = await fetch(`http://localhost:9101/chat/${project_id}`, {
        method: 'POST',
        body: JSON.stringify({ input, conversation_id, message_id }),
        headers: { 
            'Content-Type': 'application/json',
            'Response-Type': 'text/event-stream'
        }
    });
    if (!response.ok || !(response.body instanceof Readable)) {
        return new Response("Error", {
            status: 500
        });
    }
    const stream = new Readable().wrap(response.body);
    stream.on('error', (error) => {
        console.error('Stream error', error);
    });
    stream.on('data', (chunk) => {
        buffer.push(chunk);
    });
    stream.on('close', async () => {
        const content = buffer.join('');
        messages.push({ role: 'assistant', content });
        await updateConversation({ _id: conversation_id, messages });
    });
    // @ts-ignore:next-line
    return new Response(stream, {
        headers: {
          'content-type': 'text/event-stream',
        }
    });
};