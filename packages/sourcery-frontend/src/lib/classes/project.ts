import friendlyURL from "$lib/utils/friendlyurl";
import { PROJECT_DIR } from "$lib/variables";
import path from "path";
import fs from "fs";
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
import { ProjectModel } from '@sourcery/common/src/models/Project.model';

export async function check_unique(name: string) {
    const urlid = friendlyURL(name);
    const existingProject = await ProjectModel.findOne({ urlid });
    return !existingProject && !fs.existsSync(path.join(PROJECT_DIR, urlid));
}

export default class Project {
    _is_new: boolean;
    _dir: string | undefined;
    data: ProjectType | undefined;
    user_id: string;

    constructor(user_id: string, urlid: string | null = null) {
        this._is_new = true;
        this.user_id = user_id;
        if (!this.user_id) throw new Error("User is required.");
        if (!urlid) return;
        this._is_new = false;
        this._dir = path.join(PROJECT_DIR, urlid);
    }

    async _check_is_unique(urlid: string) {
        const existingProject = await ProjectModel.findOne({ urlid });
        return !existingProject && !fs.existsSync(path.join(PROJECT_DIR, urlid));
    }

    async load() {
        if (!this._is_new && this._dir) {
            const urlid = path.basename(this._dir);
            const project = await ProjectModel.findOne({
                urlid,
                $or: [
                    { owner: this.user_id },
                    { is_public: true },
                    { shared_with: this.user_id }
                ]
            });
            this.data = project?.toObject();
        }
        return this.data;
    }

    async save(data: ProjectType) {
        if (this._is_new) {
            if (!data.name) throw new Error("Project name is required.");
            if (!data.owner) throw new Error("Project owner is required.");
            
            data.urlid = friendlyURL(data.name);
            this._dir = path.join(PROJECT_DIR, data.urlid);
            
            if (!await this._check_is_unique(data.urlid)) {
                throw new Error("Project name is not unique.");
            }

            // Create project directory for files
            fs.mkdirSync(this._dir, { recursive: true });

            // Save to MongoDB
            const project = new ProjectModel(data);
            await project.save();
            this.data = project.toObject();
            this._is_new = false;
        } else {
            // Update existing project
            if (!data.urlid) throw new Error("Project urlid is required for updates.");
            
            const updated = await ProjectModel.findOneAndUpdate(
                { urlid: data.urlid },
                { ...data, updated_at: new Date() },
                { new: true }
            );

            if (!updated) {
                throw new Error("Project not found");
            }

            this.data = updated.toObject();
        }
    }

    async delete() {
        if (this._is_new || !this.data?.urlid) {
            throw new Error("Cannot delete a new or invalid project");
        }
        
        const result = await ProjectModel.deleteOne({
            urlid: this.data.urlid,
            owner: this.user_id // Only owner can delete
        });

        if (result.deletedCount === 0) {
            throw new Error("Project not found or you don't have permission to delete it");
        }
    }

    get() {
        return this.data;
    }
}
