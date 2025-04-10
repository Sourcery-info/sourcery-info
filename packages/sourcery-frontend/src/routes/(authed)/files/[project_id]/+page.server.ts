// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/** @type {import('./$types').PageServerLoad} */
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
import { error } from '@sveltejs/kit';
import { updateFile, deleteFile, getFile, getFiles, reindexFile, uploadFile } from '$lib/classes/files';
import { logger } from '@sourcery/common/src/logger';

const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});

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
	upload: async ({ request, params, locals }: { request: Request, params: { project_id: string }, locals: any }) => {
		try {
			const res_data = await uploadFile(request, params, locals);
			logger.info({ msg: 'Uploaded file', file_id: res_data[0]._id, tags: ['file', 'info'] });
			return {
				data: res_data
			};
		} catch (err: any) {
			logger.error({ msg: 'Failed to upload files', error: err, tags: ['file', 'error'] });
			return error(500, `Failed to upload files: ${err.toString()}`);
		}
	},
	deleteCollection: async ({ params }: { params: { project_id: string } }) => {
		const project_id = params.project_id;
		await qdrant.deleteCollection(project_id);
		logger.info({ msg: 'Deleted collection', project_id, tags: ['file', 'info'] });
		return {
			status: 200,
			data: {
				message: `Deleted collection for project ${params.project_id}`
			}
		};
	},
	update: async ({ request, params }: { request: Request, params: { project_id: string } }) => {
		const formData = await request.json();
		const _id = formData._id;
		if (!_id) {
			return error(400, 'No _id provided');
		}
		const updatedFile = await updateFile(formData);
		logger.info({ msg: 'Updated file', file_id: _id, tags: ['file', 'info'] });
		return {
			status: 200,
			data: {
				message: `Updated file ${_id} for project ${params.project_id}`,
				file: updatedFile
			}
		};
	},
	deleteFiles: async ({ request, params }: { request: Request, params: { project_id: string } }) => {
		const formData = await request.formData();
		for (const uid of formData.values()) {
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
		const formData = await request.formData();
		for (const _id of formData.values()) {
			const file = await getFile(_id.toString());
			if (!file) {
				return error(404, 'File not found');
			}
			await reindexFile(_id.toString());
			logger.info({ msg: 'Reindexed file', file_id: _id, tags: ['file', 'info'] });
		}
		return {
			status: 200,
			data: {
				message: `Reindexed collection for project ${params.project_id}`
			}
		};
	}
};
