/** @type {import('./$types').PageServerLoad} */
import { getEntity } from '$lib/classes/entities';
import { getChunk } from '$lib/classes/chunks';

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
	let chunks: TChunk[] = [];
	for (const chunk_id of entity?.chunk_ids) {
		const chunk = await getChunk(chunk_id);
		if (chunk) chunks.push(chunk);	
	}
	return {
		entity,
		chunks
	};
}
