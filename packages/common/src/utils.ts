import * as fs from 'node:fs';

export async function ensureDir(dir: string) {
    try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Directory ${dir} created`)
    } catch (e: any) {
        if (e.code !== 'EEXIST') {
            throw e;
        }
    }
}