/** @type {import('./$types').RequestHandler} */
import { uploadFile } from '$lib/classes/files';
import { error } from '@sveltejs/kit';

export async function POST({ request, params, locals }) {
    let res_data = [];
    try {
			res_data = await uploadFile(request, params, locals);
		} catch (err: any) {
			console.error(err);
			return error(500, `Failed to upload files: ${err.toString()}`);
		}
	return new Response(JSON.stringify({ files: res_data }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
