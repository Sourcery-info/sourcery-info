import { glob } from "glob";
import { FILETYPES } from "$lib/variables";
import { writeFileSync } from "fs";
import path from "path";
import { incrementFilename } from "@sourcery/common/src/friendlyurl";
import dotenv from "dotenv";
import { addFileToManifest } from "@sourcery/common/src/manifest";
dotenv.config();

const PROJECT_DIR = process.env.PROJECT_DIR;
if (!PROJECT_DIR) {
    throw new Error("Environment variable PROJECT_DIR not set");
}

export const getAllFiles = (project: string): string[] => {
    const files = [];
    for (const filetype of FILETYPES) {
        const pattern = `${PROJECT_DIR}/${project}/**/*.${filetype}`;
        const matches = glob.sync(pattern);
        // @ts-ignore
        files.push(...matches);
    }
    return files;
};

export const uploadFile = async (project: string, file: File) => {
    const dir = path.join(PROJECT_DIR, project, 'files');
    const buffer = await (file instanceof Blob ? file.arrayBuffer() : new Response(file).arrayBuffer());
    const filename = (file as File).name;
    let filepath = path.join(dir, filename);
    // Check that file doesn't already exist, if it does, increment filename
    while (glob.sync(filepath).length > 0) {
        console.log('file exists', filepath)
        filepath = incrementFilename(filepath);
    }
    // Write file to disk
    writeFileSync(filepath,
        Buffer.from(buffer)
    );
    // Update manifest
    addFileToManifest(project, filepath);
}