import friendlyURL from "$lib/utils/friendlyurl";
import { PROJECT_DIR } from "$lib/variables";
import path from "path";
import fs from "fs";
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';

export function check_unique(name: string) {
    const urlid = friendlyURL(name);
    return !fs.existsSync(path.join(PROJECT_DIR, urlid));
}

export default class Project {
    _is_new: boolean;
    _dir: string | undefined;
    data: ProjectType | undefined;

    constructor(urlid: string | null = null) {
        this._is_new = true;
        if (!urlid) return;
        this._is_new = false;
        this._dir = path.join(PROJECT_DIR, urlid);
        this.data = this._is_new ? {} : this._get_config();
    }

    _check_is_unique(urlid: string) {
        return !fs.existsSync(path.join(PROJECT_DIR, urlid));
    }

    _get_config() {
        const data = fs.readFileSync(`${this._dir}/config.json`, 'utf8');
        return JSON.parse(data);
    }

    save(data: ProjectType) {
        if (this._is_new) {
            if (!data.name) throw new Error("Project name is required.");
            data.urlid = friendlyURL(data.name);
            this._dir = path.join(PROJECT_DIR, data.urlid);
            // TODO: Check if directory exists and increment urlid-x if it does
            if (!this._check_is_unique(data.urlid)) {
                throw new Error("Project name is not unique.");
            }
            data.created_at = new Date();
            fs.mkdirSync(this._dir, { recursive: true });
        }
        data.updated_at = new Date();
        fs.writeFileSync(`${this._dir}/config.json`, JSON.stringify(data, null, 4));
    }

    get() {
        return this.data;
    }
}