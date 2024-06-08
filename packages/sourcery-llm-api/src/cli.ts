import fs from 'fs';
import readline from 'readline';
import dotenv from 'dotenv'
import path from "path";
import { SouceryLlamaIndex } from "./llamaindex"
dotenv.config();

const docsDir = process.env.PROJECT_DIR;

function getSubdirectories(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}

function selectDirectory(subdirectories: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('Select a directory:');
        subdirectories.forEach((subdirectory, index) => {
            console.log(`${index + 1}. ${subdirectory}`);
        });

        rl.question('Enter the number of the directory: ', (answer) => {
            rl.close();
            const selectedIndex = parseInt(answer) - 1;
            if (selectedIndex >= 0 && selectedIndex < subdirectories.length) {
                resolve(subdirectories[selectedIndex]);
            } else {
                reject(new Error('Invalid directory selection.'));
            }
        });
    });
}

async function indexDocuments(project: string, dir: string) {
    const llamaindex = new SouceryLlamaIndex(project);
    await llamaindex.indexDirectory(dir);
}

async function main() {
    try {
        if (!docsDir) throw "Environment variable PROJECT_DIR required"
        const subdirectories = getSubdirectories(docsDir);
        if (subdirectories.length < 1) throw "Project directory empty or not found"
        const selectedDirectory = await selectDirectory(subdirectories);
        console.log(`Selected directory: ${selectedDirectory}`);
        await indexDocuments(selectedDirectory, path.join(docsDir, selectedDirectory))
    } catch (error) {
        console.error(error);
    }
}

main();