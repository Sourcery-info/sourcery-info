/** @type {import('./$types').RequestHandler} */
import { getFile, updateFile } from "$lib/classes/files";
import { error } from "@sveltejs/kit";
import { FileStage, FileStatus } from "@sourcery/common/types/SourceryFile.type";
import { SourceryPub } from "@sourcery/queue/src/pub";

const pub = new SourceryPub(`file-${FileStage.UNPROCESSED}`);
export async function GET({ params }) {
    const { file_id } = params;
    const file = await getFile(file_id);
    if (!file) {
        return error(404, 'File not found');
    }
    file.stage = FileStage.UNPROCESSED;
    file.status = FileStatus.PENDING;
    file.stage_queue = [];
    file.completed_stages = [];
    file.processing = false;
    await updateFile(file);
    await pub.addJob(`file-${FileStage.UNPROCESSED}-${file_id}`, file);
    return new Response(JSON.stringify({ success: true, file: file }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};