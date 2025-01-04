import { FileStatus, FileStage } from '@sourcery/common/types/SourceryFile.type';
import { FileModel } from '@sourcery/common/src/models/File.model';
import type { SourceryFile } from '@sourcery/common/types/SourceryFile.type.js';
import { SourceryPub } from '@sourcery/queue/src/pub';
import { fileTypeWorkflows } from '@sourcery/pipeline/src/file_workflows';
import mongoose from 'mongoose';
const pub = new SourceryPub(`file-${FileStage.UNPROCESSED}`);

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
    const newFile = await FileModel.create(file);
    return mapDBFile(newFile);
}

export async function updateFile(file: SourceryFile): Promise<SourceryFile | null> {
    const _id = file._id?.toString();
    const data = { ...file, _id };
    delete data._id;
    const updatedFile = await FileModel.findByIdAndUpdate(_id, { $set: data }, { new: true });
    return updatedFile ? mapDBFile(updatedFile) : null;
}

export async function deleteFile(file_id: string): Promise<boolean> {
    const deletedFile = await FileModel.findByIdAndDelete(file_id);
    return deletedFile ? true : false;
}

export async function reindexFile(file_id: string, stage_name: FileStage = FileStage.UNPROCESSED): Promise<SourceryFile | null> {
    console.log('reindexFile', file_id, stage_name);
    const file = await getFile(file_id);
    if (!file) {
        return null;
    }
    const workflow = [...fileTypeWorkflows[file.filetype].stages];
    if (!workflow) {
        console.error(`No workflow found for file type ${file.filetype}`);
        return null;
    }
    console.log('workflow', workflow);
    if (stage_name !== FileStage.UNPROCESSED && !workflow.includes(stage_name)) {
        console.error(`Stage ${stage_name} not found in workflow for file type ${file.filetype}`);
        return null;
    }
    file.stage = stage_name;
    file.status = FileStatus.PENDING;
    file.stage_queue = [...workflow as FileStage[]];
    file.completed_stages = [];
    if (stage_name !== FileStage.UNPROCESSED) {
        const stage_index = file.stage_queue.indexOf(stage_name);
        file.stage_queue = file.stage_queue.slice(stage_index);
    }
    file.processing = false;
    console.log({ stage_name, completed_stages: file.completed_stages, stage_queue: file.stage_queue });
    await pub.clearJob(`file-${stage_name}-${file_id}`);
    await updateFile(file);
    await pub.addJob(`file-${stage_name}-${file_id}`, file);
    return file;
}