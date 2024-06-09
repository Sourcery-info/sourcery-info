import { writeFileSync, readFileSync } from "fs";
import { glob } from "glob";
import path from "path";
import dotenv from "dotenv";
import { FileStage, FileStatus, FileTypes } from "@sourcery/common/types/SourceryFile.type.ts";
dotenv.config();

const PROJECT_DIR = process.env.PROJECT_DIR;
if (!PROJECT_DIR) {
    throw new Error("Environment variable PROJECT_DIR not set");
}

/**
 * Retrieves the manifest for a given project.
 * @param {string} project - The name of the project.
 * @returns {Array<import("$lib/types/SourceryFile.type")>} - An array of file data objects.
 */
export const getManifest = (project) => {
    const files = [];
    const pattern = `${PROJECT_DIR}/${project}/files/*/metadata.json`;
    const matches = glob.sync(pattern);
    // console.log({pattern, matches});
    for (let file of matches) {
        const fileData = JSON.parse(readFileSync(file, 'utf-8'));
        files.push(fileData);
    }
    files.sort((a, b) => a.original_name - b.original_name);
    return files;
}

/**
 * Saves the manifest for a project.
 *
 * @param {string} project - The name of the project.
 * @param {object} manifest - The manifest object to be saved.
 * @returns {void}
 */
export const saveManifest = (project, manifest) => {
    const manifest_filename = path.join(PROJECT_DIR, project, 'manifest.json');
    writeFileSync(manifest_filename, JSON.stringify(manifest, null, 2));
}

/**
 * Adds a file to the manifest.
 * @param {string} project - The project name.
 * @param {string} filepath - The file path.
 * @throws {Error} If the file already exists in the manifest or if the filetype is invalid.
 */
export const addFileToManifest = (project, filepath) => {
    const manifest = getManifest(project);
    const filename = path.basename(filepath);
    // Check that file doesn't already exist in manifest
    if (manifest.find(file => file.filename === filename)) {
        throw new Error(`File already exists in manifest: ${filename}`);
    }
    const filetype = path.extname(filepath).slice(1);
    // Make sure filetype is one of the valid FileTypes
    if (!Object.values(FileTypes).includes(filetype)) {
        throw new Error(`Invalid filetype: ${filetype}`);
    }
    const file = {
        filename,
        filetype,
        project,
        status: FileStatus.ACTIVE,
        stage: FileStage.UNPROCESSED,
        created_at: new Date(),
        updated_at: null
    }
    manifest.push(file);
    saveManifest(project, manifest);
}