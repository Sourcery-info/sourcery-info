import { ensureProjectDirectory } from '@sourcery/frontend/src/lib/utils/files';
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
import { ProjectModel } from '@sourcery/common/src/models/Project.model';
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
import { SourceryPub } from '@sourcery/queue/src/pub.js';
// import type { User } from '@sourcery/common/types/User.type.js';

const ws_pub = new SourceryPub(`sourcery.info-ws`);

export async function checkUniqueName(name: string, user_id: string, project_id: string | null = null) {
    const existingProject = await ProjectModel.findOne({ name, owner: user_id });
    if (project_id && existingProject?._id.toString() === project_id) {
        return true;
    }
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
        owner: project.owner?.toString() || null,
        vector_model: project.vector_model,
        chat_model: project.chat_model,
        tags: project.tags,
        security: project.security,
        temperature: project.temperature,
    }
}

export async function getProjects(user_id: string): Promise<ProjectType[]> {
    let dbprojects: ProjectType[] = [];
    if (user_id === '*') {
        dbprojects = await ProjectModel.find({}).sort({ created_at: -1 }).populate('owner', 'username name');
    } else {
        dbprojects = await ProjectModel.find({
            $or: [
                { owner: user_id },
            { is_public: true },
            { shared_with: user_id }
        ]
        }).sort({ created_at: -1 }).populate('owner', 'username name');
    }
    return dbprojects.filter(project => project.owner).map(project => ({
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
    ws_pub.addJob(`${project.owner}:project`, { project: mapDBProject(newProject) });
    return mapDBProject(newProject);
}

export async function updateProject(project: ProjectType): Promise<void> {
    const updateData = { ...project };
    if (typeof updateData.temperature === 'number') {
        updateData.temperature = Math.max(0, Math.min(1, updateData.temperature));
    }
    await ProjectModel.findByIdAndUpdate(project._id, updateData, { 
        new: true,
        runValidators: true
    });
    ws_pub.addJob(`${project.owner}:project`, { project: mapDBProject(project) });
}

export async function removeProject(project_id: string): Promise<void> {
    const qdrant = new Qdrant({});
    const project = await ProjectModel.findById(project_id);
    if (!project) {
        return;
    }
    await Promise.all([
        ProjectModel.findByIdAndDelete(project_id),
        qdrant.deleteCollection(project_id)
    ]);
    ws_pub.addJob(`${project.owner}:project-deleted`, { project_id });
}