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
        updateProject: (projectId: string, data: Partial<Project>) => update(projects => 
            projects.map(p => p._id === projectId ? { ...p, ...data } : p)
        ),
        // Reset store
        reset: () => set([]),
        // Initialize store with projects
        init: async () => {
            const response = await fetch('/api/projects');
            if (response.ok) {
                const projects = await response.json();
                set(projects);
            }
        }
    };
}

export const projectsStore = createProjectsStore();