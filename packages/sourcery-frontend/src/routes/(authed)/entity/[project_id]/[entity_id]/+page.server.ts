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
import { getEntity } from '$lib/classes/entities';
import { getChunk } from '$lib/classes/chunks';
import { getFile } from '$lib/classes/files';

import { error } from '@sveltejs/kit';
import type { TChunk } from '@sourcery/common/types/Chunks.type';
export async function load({ params }) {
	const { entity_id } = params;
	let entity;
	try {
		entity = await getEntity(entity_id);
	} catch (e) {
		console.error(e);
		throw error(404, 'Entity not found');
	}
	if (!entity) {
		throw error(404, 'Entity not found');
	}
	let chunks: (TChunk & { file?: any })[] = [];
	for (const chunk_id of entity?.chunk_ids) {
		const chunk = await getChunk(chunk_id);
		if (chunk) {
			const file = chunk.file_id ? await getFile(chunk.file_id) : null;
			chunks.push({ ...chunk, file });
		}
	}
	return {
		entity,
		chunks
	};
}
