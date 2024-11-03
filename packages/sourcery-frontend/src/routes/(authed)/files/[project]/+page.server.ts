/** @type {import('./$types').PageServerLoad} */
import { getFiletype, uploadFile, deleteFile as deleteFileUtils } from '$lib/utils/files';
import { File as SourceryFile } from '@sourcery/common/src/file';
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
import { error } from '@sveltejs/kit';
import { WEBSOCKET_PORT } from '$lib/variables.js';
import { updateFile, deleteFile, createFile, getFile, getFiles } from '$lib/classes/files';
import { FileStatus, FileTypes } from '@sourcery/common/types/SourceryFile.type';
import { FileStage } from '@sourcery/common/types/SourceryFile.type';

const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});

export async function load({ params }) {
	const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});
	const project = params.project;
	// const manifest = getManifest(project);
	const files = await getFiles(project);
	const db_info = await qdrant.getInfo(project);
	const websocket_port = WEBSOCKET_PORT || 3001;
	return {
		props: {
			files,
			db_info,
			websocket_port,
			project
		}
	};
}

export const actions = {
	upload: async ({ request, params }) => {
		const formData = await request.formData();
		const files = formData.getAll('files');
		const project_id = params.project;
		for (const file of files) {
			const file_record = await createFile({
				project: project_id,
				original_name: "",
				filename: "",
				filetype: FileTypes.UNKNOWN,
				stage: FileStage.UNPROCESSED,
				status: FileStatus.PENDING,
				created_at: new Date(),
				updated_at: new Date(),
			});
			if (!file_record._id) {
				return error(500, 'Failed to create file record');
			}
			const { original_name, filename, filetype } = await uploadFile(project_id, file_record._id, file as File);
			const stage = FileStage.UNPROCESSED;
			await updateFile({
				...file_record,
				original_name: original_name,
				filename: filename,
				filetype,
				stage,
				status: FileStatus.ACTIVE,
			});
		}
		return {
			status: 200,
			data: {
				message: `Upload file to project ${params.project} with ${request.method} method`
			}
		};
	},
	deleteCollection: async ({ params }) => {
		console.log('Delete collection');
		const project = params.project;
		await qdrant.deleteCollection(project);
		return {
			status: 200,
			data: {
				message: `Deleted collection for project ${params.project}`
			}
		};
	},
	update: async ({ request, params }) => {
		console.log('Update file metadata');
		const formData = await request.json();
		const uid = formData.uid;
		if (!uid) {
			return error(400, 'No uid provided');
		}
		// const data = formData.get('data');
		const project = params.project;
		const file = new SourceryFile(project, uid);
		file.setData(formData);
		await file.save();
		return {
			status: 200,
			data: {
				message: `Updated collection for project ${params.project}`
			}
		};
	},
	deleteFiles: async ({ request, params }) => {
		const formData = await request.formData();
		for (const uid of formData.values()) {
			await qdrant.deleteRecord(params.project, uid.toString());
			await deleteFileUtils(params.project, uid.toString());
			await deleteFile(uid.toString());
		}
		return {
			status: 200,
			data: {
				message: `Deleted file for project ${params.project}`
			}
		};
	},
	reindexFiles: async ({ request, params }) => {
		console.log('Reindex files');
		const formData = await request.formData();
		for (const uid of formData.values()) {
			await qdrant.deleteRecord(params.project, uid.toString());
			const file = new SourceryFile(params.project, uid.toString());
			await file.reindex();
		}
		return {
			status: 200,
			data: {
				message: `Reindexed collection for project ${params.project}`
			}
		};
	}
};
