/** @type {import('./$types').PageServerLoad} */
import { uploadFile } from '$lib/utils/files';
import { File as SourceryFile } from '@sourcery/common/src/file';
import { getManifest } from '@sourcery/common/src/manifest.js';
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
import { error } from '@sveltejs/kit';
import { WEBSOCKET_PORT } from '$lib/variables.js';

const qdrant = new Qdrant({});

export async function load({ params }) {
	const qdrant = new Qdrant({});
	const project = params.project;
	const manifest = getManifest(project);
	const db_info = await qdrant.getInfo(project);
	const websocket_port = WEBSOCKET_PORT || 3001;
	return {
		props: {
			manifest,
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
		const project = params.project;
		for (const file of files) {
			await uploadFile(project, file as File);
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
			const file = new SourceryFile(params.project, uid.toString());
			await file.delete();
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
