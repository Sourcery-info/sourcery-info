import { ensureProjectDirectory } from '@sourcery/frontend/src/lib/utils/files';
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
import { ProjectModel } from '@sourcery/common/src/models/Project.model';
// import type { User } from '@sourcery/common/types/User.type.js';

export async function checkUniqueName(name: string, user_id: string) {
    const existingProject = await ProjectModel.findOne({ name, owner: user_id });
    return !existingProject;
}

export function mapDBProject(project: ProjectType): ProjectType {
    return {
        _id: project._id.toString(),
        name: project.name,
        urlid: project.urlid,
        description: project.description,
        notes: project.notes,
        is_public: project.is_public,
        shared_with: project.shared_with,
        created_at: project.created_at,
        updated_at: project.updated_at,
        owner: project.owner.toString(),
        vector_model: project.vector_model,
        chat_model: project.chat_model,
        tags: project.tags,
        security: project.security,
        temperature: project.temperature,
    }
}

export async function getProjects(user_id: string): Promise<ProjectType[]> {
    const projects = await ProjectModel.find({
        $or: [
            { owner: user_id },
            { is_public: true },
            { shared_with: user_id }
        ]
    }).sort({ created_at: -1 }).populate('owner', 'username name');
    return projects.map(project => ({
        ...mapDBProject(project),
        owner_username: (project.owner as any).username,
        owner_name: (project.owner as any).name
    }));
}

export async function getProject(project_id: string): Promise<ProjectType | null> {
    if (!project_id) return null;
    const project = await ProjectModel.findById(project_id);
    return project ? mapDBProject(project) : null;
}

export async function createProject(project: ProjectType): Promise<ProjectType> {
    const newProject = await ProjectModel.create(project);
    if (!newProject) throw new Error('Failed to create project');
    await ensureProjectDirectory(newProject._id.toString());
    return mapDBProject(newProject);
}

export async function updateProject(project: ProjectType): Promise<void> {
    await ProjectModel.findByIdAndUpdate(project._id, project, { new: true });
}
