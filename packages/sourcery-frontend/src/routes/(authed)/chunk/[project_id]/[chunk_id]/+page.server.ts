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

import { getChunk, getChunksByParent } from "$lib/classes/chunks";
import { getFile } from "$lib/classes/files";
import { getEntitiesByChunk } from "$lib/classes/entities";
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const { project_id, chunk_id } = params;
    const chunk = await getChunk(chunk_id);
    
    if (!chunk) {
        return { chunk: null };
    }

    const entities = await getEntitiesByChunk(chunk_id);

    const [file, children] = await Promise.all([
        chunk.file_id ? getFile(chunk.file_id) : null,
        getChunksByParent(chunk_id)
    ]);

    let parent = null;
    if (chunk.parent) {
        parent = await getChunk(chunk.parent);
    }

    return { 
        chunk,
        file,
        parent,
        children,
        entities,
        project_id
    };
};