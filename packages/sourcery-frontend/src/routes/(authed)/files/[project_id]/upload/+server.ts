/** @type {import('./$types').RequestHandler} */
import { updateFile, createFile } from '$lib/classes/files';
import { uploadFile } from '$lib/utils/files';
import { getProject } from '$lib/classes/projects';
import { FileTypes, FileStatus, FileStage } from '@sourcery/common/types/SourceryFile.type';
import { error } from '@sveltejs/kit';
import { SourceryPub } from '@sourcery/queue/src/pub';

const pub = new SourceryPub(`file-${FileStage.UNPROCESSED}`);

export async function POST({ request, params, locals }) {
	const formData = await request.formData();
    const files = formData.getAll('files');
    const project_id = params.project_id;
    const user_id = locals.user.user_id;
    if (!user_id) {
        return error(401, 'Unauthorized');
    }
    const project = await getProject(project_id);
    if (!project) {
        return error(404, 'Project not found');
    }
    if (project.owner !== user_id) {
        return error(403, 'Forbidden - you are not the owner of this project');
    }
    let res_data = [];
    for (const file of files) {
        const file_record = await createFile({
            project: project_id,
            user_id: user_id,
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
            stage_paths: {},
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
