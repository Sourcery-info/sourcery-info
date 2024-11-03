import { FileModel } from '@sourcery/common/src/models/File.model';
import type { SourceryFile } from '@sourcery/common/types/SourceryFile.type.js';

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
    };
}

export async function getFiles(project_id: string): Promise<SourceryFile[]> {
    const files = await FileModel.find({ project: project_id });
    return files.map(mapDBFile);
}

export async function getFile(file_id: string): Promise<SourceryFile | null> {
    const file = await FileModel.findById(file_id);
    return file ? mapDBFile(file) : null;
}

export async function createFile(file: SourceryFile): Promise<SourceryFile> {
    const newFile = await FileModel.create(file);
    return mapDBFile(newFile);
}

export async function updateFile(file: SourceryFile): Promise<SourceryFile | null> {
    const updatedFile = await FileModel.findByIdAndUpdate(file._id, file, { new: true });
    return updatedFile ? mapDBFile(updatedFile) : null;
}

export async function deleteFile(file_id: string): Promise<boolean> {
    const deletedFile = await FileModel.findByIdAndDelete(file_id);
    return deletedFile ? true : false;
}