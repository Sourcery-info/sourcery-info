/** @type {import('./$types').PageServerLoad} */
import { getFiletype, uploadFile, deleteFile as deleteFileUtils } from '$lib/utils/files';
import { File as SourceryFile } from '@sourcery/common/src/file';
import { SourceryPub } from '@sourcery/queue/src/pub';
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
import { error, redirect } from '@sveltejs/kit';
import { WEBSOCKET_PORT } from '$lib/variables.js';
import { updateFile, deleteFile, createFile, getFile, getFiles } from '$lib/classes/files';
import { FileStatus, FileTypes } from '@sourcery/common/types/SourceryFile.type';
import { FileStage } from '@sourcery/common/types/SourceryFile.type';

const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});

const pub = new SourceryPub(`file-${FileStage.UNPROCESSED}`);

export async function load({ params }) {
	const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});
	const project_id = params.project_id;
	const file_id = params.file_id;
	const file = await getFile(file_id);
	const db_info = await qdrant.getInfo(project_id);
	const websocket_port = WEBSOCKET_PORT || 3001;
	return {
		props: {
			file,
			db_info,
			websocket_port,
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
		const file = await getFile(file_id);
		if (!file) {
			return error(404, 'File not found');
		}
		file.stage = FileStage.UNPROCESSED;
		file.status = FileStatus.PENDING;
		file.processing = false;
		await updateFile(file);
		await pub.addJob(`file-${FileStage.UNPROCESSED}-${file_id}`, file);
		return {
			success: true,
			file: file
		};
	}
};