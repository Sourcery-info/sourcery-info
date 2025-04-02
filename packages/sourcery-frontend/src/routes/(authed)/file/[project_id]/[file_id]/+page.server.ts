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
import { deleteFile as deleteFileUtils } from '$lib/utils/files';
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
import { error, redirect } from '@sveltejs/kit';
import { deleteFile, getFile, reindexFile } from '$lib/classes/files';
import { logger } from '@sourcery/common/src/logger';

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
			// Delete from database
			await deleteFile(file_id);
			// Delete from storage
			await deleteFileUtils(project_id, file_id);
			// Delete from vector database
			await qdrant.deleteFile(project_id, file_id);
			logger.info({ msg: 'File deleted', file_id, tags: ['file', 'info'] });
			// Redirect after successful deletion
		} catch (err) {
			logger.error({ msg: 'Error deleting file', error: err, tags: ['file', 'error'] });
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