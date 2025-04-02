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
