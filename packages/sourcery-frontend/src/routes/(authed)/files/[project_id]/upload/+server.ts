/** @type {import('./$types').RequestHandler} */
import { updateFile, createFile } from '$lib/classes/files';
import { uploadFile } from '$lib/classes/files';
import { getProject } from '$lib/classes/projects';
import { FileTypes, FileStatus, FileStage } from '@sourcery/common/types/SourceryFile.type';
import { error } from '@sveltejs/kit';
import { SourceryPub } from '@sourcery/queue/src/pub';

const pub = new SourceryPub(`file-${FileStage.UNPROCESSED}`);

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
