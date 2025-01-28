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
            files.map(f => f._id === fileId ? { ...f, ...data } : f)
        ),
        // Upsert with proper duplicate handling
        upsert: (file: SourceryFile) => {
            update(files => {
                const existingFiles = files.filter(f => f._id !== file._id);
                return [file, ...existingFiles];
            });
        },
        // Reset store
        reset: () => set([])
    };
}

export const filesStore = createFilesStore(); 