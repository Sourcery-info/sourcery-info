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

import { writable } from 'svelte/store';
import type { SourceryFile } from '$lib/types/SourceryFile.type';

function createFilesStore() {
    const { subscribe, set, update } = writable<SourceryFile[]>([]);

    return {
        subscribe,
        set,
        // Ensure we only set unique files
        setUnique: (files: SourceryFile[]) => {
            const uniqueFiles = [...new Map(files.map(file => [file._id, file])).values()];
            set(uniqueFiles);
        },
        update,
        // Add a file only if it doesn't exist
        add: (file: SourceryFile) => update(files => {
            if (files.some(f => f._id === file._id)) return files;
            return [...files, file];
        }),
        // Remove a file
        remove: (fileId: string) => update(files => files.filter(f => f._id !== fileId)),
        // Update a file
        updateOne: (fileId: string, data: Partial<SourceryFile>) => update(files => 
            files.map(f => {
                if (f._id === fileId) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = f.__v ?? 0;
                    const newVersion = data.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        return { ...f, ...data };
                    }
                    return f;
                }
                return f;
            })
        ),
        // Upsert with proper duplicate handling
        upsert: (file: SourceryFile) => {
            update(files => {
                const existingFiles = files.filter(f => f._id !== file._id);
                const existingFile = files.find(f => f._id === file._id);
                if (existingFile) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = existingFile.__v ?? 0;
                    const newVersion = file.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        return [file, ...existingFiles];
                    }
                    return files;
                }
                return [file, ...existingFiles];
            });
        },
        // Reset store
        reset: () => set([]),
    };
}

export const filesStore = createFilesStore(); 