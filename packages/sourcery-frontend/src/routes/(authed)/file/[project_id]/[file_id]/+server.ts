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

/** @type {import('./$types').RequestHandler} */
import { getFile, updateFile } from '$lib/classes/files';
import { error } from '@sveltejs/kit';
import { deleteFile } from '$lib/classes/files';
import type { SourceryFile } from '@sourcery/common/types/SourceryFile.type';

export async function DELETE({ params }) {
    const { file_id } = params;
    try {
        await deleteFile(file_id);
    } catch (err) {
        console.error('Error deleting file:', err);
        throw error(500, 'Failed to delete file');
    }
    return new Response();
};

export async function PUT({ params, request, locals }) {
    const allowed_params = ['status'] as const;
    const { file_id } = params;
    const file = await getFile(file_id);
    if (!file) {
        throw error(404, 'File not found');
    }
    
    // Check if the current user is the file owner
    if (file.user_id !== locals.user?.user_id) {
        throw error(403, 'Unauthorized: Only file owners can modify file status');
    }

    const body = await request.json() as Partial<SourceryFile>;
    for (const param of allowed_params) {
        if (body[param]) {
            (file as any)[param] = body[param];
        }
    }
    await updateFile(file);
    return new Response();
};