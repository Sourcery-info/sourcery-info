/** @type {import('./$types').RequestHandler} */
import { reindexFile } from "$lib/classes/files";

export async function GET({ params }) {
    const { file_id } = params;
    const file = await reindexFile(file_id);
    if (!file) {
        return new Response("File not found", {
            status: 404
        });
    }
    return new Response(JSON.stringify({ success: true, file: file }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};