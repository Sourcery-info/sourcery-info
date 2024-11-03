// DEPRECATED

import { glob } from "glob";
import path from "path";
import dotenv from "dotenv";
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
