import { mkdtemp, writeFile, copyFile, mkdir, rm } from "node:fs/promises";
import path from "path";
import { md5 } from "./crypto";
import {tmpdir} from 'os';
// import { PROJECT_DIR } from "$lib/variables";
import { FileStage, FileTypes } from "@sourcery/common/types/SourceryFile.type";
import { ensureDir } from "@sourcery/common/src/utils";
import { readdir } from "node:fs/promises";
import dotenv from 'dotenv';
dotenv.config();

const PROJECT_DIR = path.resolve(process.env.PROJECT_DIR || 'projects');

export const getFilepath = (project_id: string, file_id: string) => {
    return path.join(PROJECT_DIR, project_id, "files", file_id);
}

export const uploadFile = async (project_id: string, file_id: string, file: File) => {
    const buffer = await (file instanceof Blob ? file.arrayBuffer() : new Response(file).arrayBuffer());
    const filename = (file as File).name;
    const tempDir = await mkdtemp(path.join(tmpdir(), 'sourcery-'));
    const tempFilePath = path.join(tempDir, filename);
    await writeFile(tempFilePath, Buffer.from(buffer));
    const new_filename = md5(tempFilePath);
    const filetype = getFiletype(filename);
    const stage = FileStage.UNPROCESSED;
    const files_dir = getFilepath(project_id, file_id);
    const new_filepath = path.join(files_dir, stage, `${new_filename}.${filetype}`);
    ensureDir(path.join(files_dir, stage));
    await copyFile(tempFilePath, new_filepath);
    return {
        original_name: filename,
        filepath: new_filepath,
        filename: new_filename,
        filetype,
    };
}

export const deleteFile = async (project_id: string, file_id: string) => {
    const filepath = getFilepath(project_id, file_id);
    await rm(filepath, { recursive: true, force: true });
    return true;
}

export const getFiletype = (filename: string): FileTypes => {
    const filetype = path.extname(filename).replace(".", "");
    return FileTypes[filetype.toUpperCase() as keyof typeof FileTypes];
}

export const getDirectories = async (source: string) => 
    (await readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

export async function ensureProjectDirectory(project_id: string) {
    const projectDir = path.join(PROJECT_DIR, project_id);
    await mkdir(projectDir, { recursive: true });
}