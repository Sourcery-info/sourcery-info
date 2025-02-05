import { FileStatus, FileStage, FileTypes } from '@sourcery/common/types/SourceryFile.type';
import { deleteFile as deleteFileUtils } from '$lib/utils/files';
import { FileModel } from '@sourcery/common/src/models/File.model';
import type { SourceryFile } from '@sourcery/common/types/SourceryFile.type.js';
import { SourceryPub } from '@sourcery/queue/src/pub';
import { fileTypeWorkflows } from '@sourcery/pipeline/src/file_workflows';
import { uploadFile as uploadFileUtils } from '@sourcery/frontend/src/lib/utils/files';
import mongoose from 'mongoose';
import { getProject } from './projects';
import { error } from '@sveltejs/kit';
import { logger } from '@sourcery/common/src/logger';
import { deleteEntitiesByFile } from './entities';
import { deleteChunksByFile } from './chunks';
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
const pub = new SourceryPub(`file-${FileStage.UNPROCESSED}`);
const ws_pub = new SourceryPub(`sourcery.info-ws`);
const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});
export function mapDBFile(file: SourceryFile): SourceryFile {
    return {
        _id: file._id?.toString(),
        original_name: file.original_name,
        filename: file.filename,
        metadata: file.metadata,
        filetype: file.filetype,
        project: file.project.toString(),
        status: file.status,
        stage: file.stage,
        created_at: file.created_at,
        updated_at: file.updated_at,
        stage_queue: file.stage_queue,
        completed_stages: file.completed_stages,
        processing: file.processing,
        stage_paths: file.stage_paths,
        user_id: file.user_id?.toString()
    };
}

export async function getFiles(project_id: string, file_ids?: string[]): Promise<SourceryFile[]> {
    const query: any = { project: project_id };
    if (file_ids) {
        query._id = { $in: file_ids };
    }
    const files = await FileModel.find(query);
    return files.map(mapDBFile);
}

export async function getFile(file_id: string): Promise<SourceryFile | null> {
    const file = await FileModel.findById(new mongoose.Types.ObjectId(file_id));
    return file ? mapDBFile(file) : null;
}

export async function createFile(file: SourceryFile): Promise<SourceryFile> {
    if (!file.user_id) {
        throw new Error('User ID is required');
    }
    const newFile = await FileModel.create(file);
    return mapDBFile(newFile);
}

export async function updateFile(file: SourceryFile): Promise<SourceryFile | null> {
    const _id = file._id?.toString();
    const data = { ...file, _id };
    delete data._id;
    const updatedFile = await FileModel.findByIdAndUpdate(_id, { $set: data }, { new: true });
    ws_pub.addJob(`${file.user_id}:file`, {
        id: file._id,
        file: file,
        message: "File updated"
    });
    return updatedFile ? mapDBFile(updatedFile) : null;
}

export async function deleteFile(file_id: string): Promise<boolean> {
    const deletedFile = await FileModel.findByIdAndDelete(file_id);
    if (!deletedFile) {
        return false;
    }
    const project_id = deletedFile?.project.toString();
    if (!project_id) {
        return false;
    }
    await deleteEntitiesByFile(file_id);
    await deleteChunksByFile(file_id);
    await deleteFileUtils(project_id, file_id);
    await qdrant.deleteFile(project_id, file_id);
    ws_pub.addJob(`${deletedFile?.user_id}:file-deleted`, {
        id: deletedFile?._id,
        file: deletedFile,
        message: "File deleted"
    });
    return deletedFile ? true : false;
}

export async function reindexFile(file_id: string, stage_name: FileStage = FileStage.UNPROCESSED): Promise<SourceryFile | null> {
    const file = await getFile(file_id);
    if (!file) {
        return null;
    }
    const workflow = [...fileTypeWorkflows[file.filetype].stages];
    if (!workflow) {
        logger.error({ msg: `No workflow found for file type ${file.filetype}`, file_id, tags: ['file', 'error'] });
        return null;
    }
    if (stage_name !== FileStage.UNPROCESSED && !workflow.includes(stage_name)) {
        logger.error({ msg: `Stage ${stage_name} not found in workflow for file type ${file.filetype}`, file_id, tags: ['file', 'error'] });
        return null;
    }
    file.stage = stage_name;
    file.status = FileStatus.PENDING;
    file.stage_queue = [...workflow as FileStage[]];
    file.completed_stages = [];
    if (stage_name !== FileStage.UNPROCESSED) {
        const stage_index = file.stage_queue.indexOf(stage_name);
        file.completed_stages = file.stage_queue.slice(0, stage_index);
        file.stage_queue = file.stage_queue.slice(stage_index + 1);
        if (file.completed_stages[0] !== FileStage.UNPROCESSED) {
            file.completed_stages.unshift(FileStage.UNPROCESSED);
        }
    }
    file.processing = false;
    for (const clear_stage of workflow) {
        await pub.clearJob(`file-${clear_stage}-${file_id}`);
    }
    await updateFile(file);
    await pub.addJob(`file-${stage_name}-${file_id}`, file);
    return file;
}

export async function uploadFile(request: Request, params: any, locals: any) {
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
        const { original_name, filename, filetype } = await uploadFileUtils(project_id, file_record._id, file as File);
        const stage = FileStage.UNPROCESSED;
        const data = {
            ...file_record,
            original_name: original_name,
            filename: filename,
            filetype,
            stage,
        };
        await updateFile(data);
        ws_pub.addJob(`${user_id}:file`, {
            id: file_record._id,
            file: data,
            message: "File uploaded"
        });
        await pub.addJob(`file-${stage}-${file_record._id}`, data);
        res_data.push(data);
    }
    return res_data;
}

export async function searchFiles(project_id: string, query: string): Promise<SourceryFile[]> {
    if (!query.trim()) {
        return [];
    }

    const files = await FileModel.find(
        {
            project: new mongoose.Types.ObjectId(project_id),
            $text: { $search: query }
        },
        { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" }, filename: 1 })
    .limit(10);

    return files;
}