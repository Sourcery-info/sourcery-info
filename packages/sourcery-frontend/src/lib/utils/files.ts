import { mkdtemp, writeFile } from "node:fs/promises";
import path from "path";
import { File as SourceryFile } from "@sourcery/common/src/file";
import {tmpdir} from 'os';
import fs from 'fs';
import { readdirSync } from 'fs'
import { PROJECT_DIR } from "$lib/variables";

export const uploadFile = async (project: string, file: File) => {
    const buffer = await (file instanceof Blob ? file.arrayBuffer() : new Response(file).arrayBuffer());
    const filename = (file as File).name;
    const tempDir = await mkdtemp(path.join(tmpdir(), 'sourcery-'));
    const tempFilePath = path.join(tempDir, filename);
    await writeFile(tempFilePath, Buffer.from(buffer));
    new SourceryFile(project, null, tempFilePath);
}

export const getDirectories = (source: string) => readdirSync(source, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)

export async function ensureProjectDirectory(project_id: string) {
    const projectDir = path.join(PROJECT_DIR, project_id);
    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
    }
}