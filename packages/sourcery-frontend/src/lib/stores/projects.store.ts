import { writable } from 'svelte/store';
import type { Project } from '@sourcery/common/types/Project.type';

function createProjectsStore() {
    const { subscribe, set, update } = writable<Project[]>([]);

    return {
        subscribe,
        set,
        update,
        // Add a project
        add: (project: Project) => update(projects => [...projects, project]),
        // Remove a project
        remove: (projectId: string) => update(projects => projects.filter(p => p._id !== projectId)),
        // Update a project
        updateOne: (projectId: string, data: Partial<Project>) => update(projects => 
            projects.map(p => {
                if (p._id === projectId) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = p.__v ?? 0;
                    const newVersion = data.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        return { ...p, ...data };
                    }
                    return p;
                }
                return p;
            })
        ),
        upsert: (project: Project) => {
            update(projects => {
                const index = projects.findIndex(p => p._id === project._id);
                if (index !== -1) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = projects[index].__v ?? 0;
                    const newVersion = project.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        projects[index] = { ...projects[index], ...project };
                    }
                } else {
                    projects.unshift(project);
                }
                return projects;
            });
        },
        // Reset store
        reset: () => set([]),
    };
}

export const projectsStore = createProjectsStore();
