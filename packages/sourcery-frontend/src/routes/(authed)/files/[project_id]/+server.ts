/** @type {import('./$types').RequestHandler} */
import { getFiles } from '$lib/classes/files';

export async function GET({ params }) {
	const files = await getFiles(params.project_id);
	return new Response(JSON.stringify(files), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

// Named function POST to upload files
export async function POST({ params, request }) {
    
    return new Response();
};