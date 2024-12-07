/** @type {import('./$types').RequestHandler} */
import { getFiles, updateFile, createFile } from '$lib/classes/files';
import { getFiletype, uploadFile, deleteFile as deleteFileUtils } from '$lib/utils/files';
import { FileTypes, FileStatus, FileStage } from '@sourcery/common/types/SourceryFile.type';
import { error } from '@sveltejs/kit';
import { SourceryPub } from '@sourcery/queue/src/pub';

const pub = new SourceryPub(`file-${FileStage.UNPROCESSED}`);

export async function POST({ request, params }) {
	const formData = await request.formData();
    const files = formData.getAll('files');
    const project_id = params.project_id;
    let res_data = [];
    for (const file of files) {
        const file_record = await createFile({
            project: project_id,
            original_name: "",
            filename: "",
            filetype: FileTypes.UNKNOWN,
            stage: FileStage.UNPROCESSED,
            status: FileStatus.PENDING,
            created_at: new Date(),
            updated_at: new Date(),
            stage_queue: [],
            completed_stages: [],
            processing: false,
        });
        if (!file_record._id) {
            return error(500, 'Failed to create file record');
        }
        const { original_name, filename, filetype } = await uploadFile(project_id, file_record._id, file as File);
        const stage = FileStage.UNPROCESSED;
        const data = {
            ...file_record,
            original_name: original_name,
            filename: filename,
            filetype,
            stage,
        };
        await updateFile(data);
        await pub.addJob(`file-${stage}-${file_record._id}`, data);
        res_data.push(data);
    }
	return new Response(JSON.stringify({ files: res_data }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
