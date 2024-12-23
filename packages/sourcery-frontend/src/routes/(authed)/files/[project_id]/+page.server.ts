/** @type {import('./$types').PageServerLoad} */
import { uploadFile, deleteFile as deleteFileUtils } from '$lib/utils/files';
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
import { error } from '@sveltejs/kit';
import { updateFile, deleteFile, createFile, getFile, getFiles, reindexFile } from '$lib/classes/files';
import { FileStatus, FileTypes } from '@sourcery/common/types/SourceryFile.type';
import { FileStage } from '@sourcery/common/types/SourceryFile.type';
import { SourceryPub } from '@sourcery/queue/src/pub';

const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});
const pub = new SourceryPub(`file-${FileStage.UNPROCESSED}`);

export async function load({ params }) {
	const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});
	const project_id = params.project_id;
	// const manifest = getManifest(project);
	const files = await getFiles(project_id);
	const db_info = await qdrant.getInfo(project_id);
	return {
		props: {
			files,
			db_info,
			project_id
		}
	};
}

export const actions = {
	upload: async ({ request, params }) => {
		const formData = await request.formData();
		const files = formData.getAll('files');
		const project_id = params.project_id;
		let res_data = [];
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
				stage_queue: [],
				completed_stages: [],
				processing: false,
			});
			if (!file_record._id) {
				return error(500, 'Failed to create file record');
			}
			const { original_name, filename, filetype } = await uploadFile(project_id, file_record._id, file as File);
			const stage = FileStage.UNPROCESSED;
			const data = {
				...file_record,
				original_name: original_name,
				filename: filename,
				filetype,
				stage,
			};
			await updateFile(data);
			await pub.addJob(`file-${stage}-${file_record._id}`, data);
			res_data.push(data);
		}
		return {
			data: res_data
		};
	},
	deleteCollection: async ({ params }) => {
		console.log('Delete collection');
		const project_id = params.project_id;
		await qdrant.deleteCollection(project_id);
		return {
			status: 200,
			data: {
				message: `Deleted collection for project ${params.project_id}`
			}
		};
	},
	update: async ({ request, params }) => {
		console.log('Update file metadata');
		const formData = await request.json();
		const _id = formData._id;
		if (!_id) {
			return error(400, 'No _id provided');
		}
		const updatedFile = await updateFile(formData);
		console.log('Updated file:', updatedFile);
		return {
			status: 200,
			data: {
				message: `Updated file ${_id} for project ${params.project_id}`,
				file: updatedFile
			}
		};
	},
	deleteFiles: async ({ request, params }) => {
		const formData = await request.formData();
		for (const uid of formData.values()) {
			await qdrant.deleteRecord(params.project_id, uid.toString());
			await deleteFileUtils(params.project_id, uid.toString());
			await deleteFile(uid.toString());
		}
		return {
			status: 200,
			data: {
				message: `Deleted file for project ${params.project_id}`
			}
		};
	},
	reindexFiles: async ({ request, params }) => {
		console.log('Reindex files');
		const formData = await request.formData();
		for (const _id of formData.values()) {
			const file = await getFile(_id.toString());
			if (!file) {
				return error(404, 'File not found');
			}
			await reindexFile(_id.toString());
		}
		return {
			status: 200,
			data: {
				message: `Reindexed collection for project ${params.project_id}`
			}
		};
	}
};
