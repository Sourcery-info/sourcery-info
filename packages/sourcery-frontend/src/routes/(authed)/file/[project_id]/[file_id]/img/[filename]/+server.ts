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

import { PROJECT_DIR } from "$lib/variables"
import { promises as fs } from "fs";
import { existsSync } from "fs";
import { error } from '@sveltejs/kit';
import { getFile } from "$lib/classes/files";

const CONTENT_TYPES = {
    pdf: 'application/pdf',
    json: 'application/json',
    html: 'text/html',
    text: 'text/plain',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    odt: 'application/vnd.oasis.opendocument.text',
    rtf: 'application/rtf',
    md: 'text/markdown',
    txt: 'text/plain',
    csv: 'text/csv',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    tsv: 'text/tab-separated-values',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    flac: 'audio/flac',
};

export async function GET({ params }) {
    const file_id = params.file_id;
    const project_id = params.project_id;
    const filename = params.filename;
    if (!project_id || !file_id || !filename) {
        return error(404, 'Not Found');
    }
    const file = await getFile(file_id);
    if (!file) {
        return error(404, 'File not found');
    }
    const file_path = `${PROJECT_DIR}/${project_id}/files/${file_id}/md/${filename}`;
    if (!existsSync(file_path)) {
        return error(404, 'File not found');
    }
    const ext = filename.split('.').pop();
    const content_type = CONTENT_TYPES[ext as keyof typeof CONTENT_TYPES] || 'application/octet-stream';
    const file_contents = await fs.readFile(file_path);
    return new Response(file_contents, {
        headers: {
            'content-type': content_type,
            'cache-control': 'public, max-age=31536000', // Cache for 1 year
        },
    });
}