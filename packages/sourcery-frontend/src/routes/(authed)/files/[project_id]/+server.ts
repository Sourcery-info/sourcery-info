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
import { getFiles } from '$lib/classes/files';

export async function GET({ params }) {
	const files = await getFiles(params.project_id);
	return new Response(JSON.stringify(files), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

// Named function POST to upload files
export async function POST({ params, request }) {
    
    return new Response();
};