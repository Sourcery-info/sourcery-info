// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dir: string) {
    try {
        fs.mkdirSync(dir, { recursive: true });
    } catch (e: any) {
        if (e.code !== 'EEXIST') {
            throw e;
        }
    }
}

export async function isValidImage(imagePath: string): Promise<boolean> {
    // Check file extension first
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(imagePath).toLowerCase();
    if (!validExtensions.includes(ext)) {
        return false;
    }
    try {
        // Read first few bytes to check magic numbers
        const fileHandle = await fsPromises.open(imagePath, 'r');
        const buffer = Buffer.alloc(12);  // Allocate 12 bytes for all format checks
        await fileHandle.read(buffer, 0, 12);
        await fileHandle.close();
        
        // Check magic numbers for common image formats
        const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
        const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
        const isGIF = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
        const isWEBP = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

        return isJPEG || isPNG || isGIF || isWEBP;
    } catch (error) {
        console.error(`Error reading file ${imagePath}:`, error);
        return false;
    }
}