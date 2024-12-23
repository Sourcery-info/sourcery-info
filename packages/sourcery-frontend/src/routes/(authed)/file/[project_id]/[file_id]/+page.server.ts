/** @type {import('./$types').PageServerLoad} */
import { deleteFile as deleteFileUtils } from '$lib/utils/files';
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
import { error, redirect } from '@sveltejs/kit';
import { deleteFile, getFile, reindexFile } from '$lib/classes/files';

const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});

export async function load({ params }) {
	const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});
	const project_id = params.project_id;
	const file_id = params.file_id;
	const file = await getFile(file_id);
	const db_info = await qdrant.getInfo(project_id);
	return {
		props: {
			file,
			db_info,
			project_id
		}
	};
}

export const actions = {
	delete: async ({ params }) => {
		const { project_id, file_id } = params;
		
		try {
			console.log('Deleting file:', file_id);
			// Delete from database
			await deleteFile(file_id);
			console.log('File deleted from database');
			
			// Delete from storage
			await deleteFileUtils(project_id, file_id);
			console.log('File deleted from storage');
			
			// Delete from vector database
			await qdrant.deleteCollection(file_id);
			console.log('File deleted from vector database');
			// Redirect after successful deletion
		} catch (err) {
			console.error('Error deleting file:', err);
			throw error(500, 'Failed to delete file');
		}
		redirect(303, `/project/${project_id}`);
	},
	reindex: async ({ params }) => {
		const { file_id } = params;
		const file = await reindexFile(file_id);
		if (!file) {
			return error(404, 'File not found');
		}
		return {
			success: true,
			file: file
		};
	}
};