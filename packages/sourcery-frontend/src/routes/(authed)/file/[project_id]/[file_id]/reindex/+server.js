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
import { reindexFile } from "$lib/classes/files";

export async function GET({ params }) {
    const { file_id } = params;
    const file = await reindexFile(file_id);
    if (!file) {
        return new Response("File not found", {
            status: 404
        });
    }
    return new Response(JSON.stringify({ success: true, file: file }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};