import { writable } from 'svelte/store';
import type { SourceryFile } from '$lib/types/SourceryFile.type';

function createFilesStore() {
    const { subscribe, set, update } = writable<SourceryFile[]>([]);

    return {
        subscribe,
        set,
        update,
        // Add a file
        add: (file: SourceryFile) => update(files => [...files, file]),
        // Remove a file
        remove: (fileId: string) => update(files => files.filter(f => f._id !== fileId)),
        // Update a file
        updateFile: (fileId: string, data: Partial<SourceryFile>) => update(files => 
            files.map(f => f._id === fileId ? { ...f, ...data } : f)
        ),
        // Reset store
        reset: () => set([])
    };
}

export const filesStore = createFilesStore(); 