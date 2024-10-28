import { getDirectories } from '$lib/utils/files';
import { PROJECT_DIR } from "$lib/variables"
import Project from "$lib/classes/project";
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
import { ProjectModel } from '@sourcery/common/src/models/Project.model';
// import type { User } from '@sourcery/common/types/User.type.js';

export default class Projects {
    projects: ProjectType[];
    user_id: string;

    constructor(user_id: string) {
        this.user_id = user_id;
        this.projects = [];
        this.load_projects();
    }

    async load_projects() {
        // Fetch projects using Mongoose ProjectModel
        const projects = await ProjectModel.find({
            $or: [
                { owner: this.user_id },
                { is_public: true },
                { shared_with: this.user_id }
            ]
        });
        // Convert Mongoose documents to plain objects
        return projects.map(project => {
            return {
                name: project.name,
                urlid: project.urlid,
                description: project.description,
                notes: project.notes,
                is_public: project.is_public,
                shared_with: project.shared_with,
                created_at: project.created_at
            }
        });
    }

    get_project(urlid: string): ProjectType {
        const project = this.projects.find(project => project.urlid === urlid);
        if (!project) throw new Error('Project not found');
        return project;
    }

    get(): ProjectType[] {
        return this.projects;
    }
}
