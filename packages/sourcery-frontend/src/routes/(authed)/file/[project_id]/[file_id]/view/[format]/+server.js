// @ts-nocheck
/** @type {import('./$types').RequestHandler} */
import { PROJECT_DIR } from "$lib/variables"
import fs from "fs";
import { error } from '@sveltejs/kit';
import { getFile } from "$lib/classes/files";
import { marked } from 'marked';

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

async function format_original(filename, filetype) {
    const contents = fs.readFileSync(filename);
    const content_type = CONTENT_TYPES[filetype] || 'application/octet-stream';
    return {
        headers: {
            'content-type': content_type,
        },
        body: contents,
    };
}

export async function GET({ params }) {
    const file_id = params.file_id;
    const format = params.format; // Extract the format from the params
    const project_id = params.project_id;
    if (!project_id || !file_id) {
        return error(404, 'Not Found');
    }
    const file = await getFile(file_id);
    if (!file) {
        return error(404, 'File not found');
    }
    let response = null;
    switch (format) {
        case 'original':
            response = await format_original(`${PROJECT_DIR}/${project_id}/files/${file_id}/unprocessed/${file.filename}.${file.filetype}`, file.filetype);
            break;
        case 'md':
            const md = fs.readFileSync(`${PROJECT_DIR}/${project_id}/files/${file_id}/md/${file.filename}.md`, 'utf8');
            const html = marked(md); // Convert markdown to HTML
            response = {
                headers: {
                    'content-type': 'text/html',
                },
                body: html
            };
            break;
        // case 'html':
        //     return {
        //         headers: {
        //             'content-type': 'text/html',
        //         },
        //         body: `<pre>${JSON.stringify(file, null, 2)}</pre>`,
        //     };
        default:
            return error(404, 'Not Found');
    }
    return new Response(response.body, {
        headers: response.headers,
    })
};