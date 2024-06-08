/** @type {import('./$types').RequestHandler} */
import fetch from 'node-fetch';
import { Readable } from "node:stream";

export async function POST({ params, request }) {
    const { project, conversation } = params;
    const { input } = await request.json();
    console.log(JSON.stringify({ input, conversation }));
    const response = await fetch(`http://localhost:9101/chat/${project}`, {
        method: 'POST',
        body: JSON.stringify({ input, conversation }),
        headers: { 
            'Content-Type': 'application/json',
            'Response-Type': 'text/event-stream'
        }
    });
    console.log(response);
    if (!response.ok || !(response.body instanceof Readable)) {
        return new Response("Error", {
            status: 500
        });
    }
    const stream = new Readable().wrap(response.body);
    // @ts-ignore:next-line
    return new Response(stream, {
        headers: {
          'content-type': 'text/event-stream',
        }
    });
};