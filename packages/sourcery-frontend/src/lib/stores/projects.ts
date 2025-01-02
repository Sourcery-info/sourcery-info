import { writable } from 'svelte/store';
import type { Project } from '../types/Project.type';

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
            projects.map(p => p._id === projectId ? { ...p, ...data } : p)
        ),
        upsert: (project: Project) => {
            update(projects => {
                const index = projects.findIndex(p => p._id === project._id);
                if (index !== -1) {
                    projects[index] = { ...projects[index], ...project };
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
