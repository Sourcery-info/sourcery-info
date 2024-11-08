import * as fs from 'node:fs';

export async function ensureDir(dir: string) {
    try {
        fs.mkdirSync(dir, { recursive: true });
    } catch (e: any) {
        if (e.code !== 'EEXIST') {
            throw e;
        }
    }
}