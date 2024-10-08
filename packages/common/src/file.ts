import type { SourceryFile, StageLog } from "@sourcery/common/types/SourceryFile.type.ts"
import { FileTypes, FileStatus, FileStage } from "@sourcery/common/types/SourceryFile.type.ts"
import fs from 'fs';
import { readFile } from 'fs/promises';
import path from "path";
import { ensureDir } from "@sourcery/common/src/utils.ts";
import crypto from 'crypto';

export class File implements SourceryFile {
    uid: string | undefined;
    filename: string;
    original_name: string | undefined;
    metadata: string | undefined;
    filetype: FileTypes;
    project: string;
    status: FileStatus;
    stage: FileStage | string;
    stage_logs: StageLog[] | undefined;
    created_at: Date;
    updated_at: Date | null;

    constructor(project: string, uid: string | null = null, filename: string | null = null) {
        this.project = project;
        let sourceryfile: SourceryFile;
        if (uid !== null) {
            sourceryfile = this.load_metadata(uid);
        } else if (filename !== null) {
            sourceryfile = this.init(filename);
        } else {
            throw new Error("Either uid or filename must be provided");
        }
        this.uid = sourceryfile.uid;
        this.filename = sourceryfile.filename;
        this.original_name = sourceryfile.original_name;
        this.metadata = sourceryfile.metadata;
        this.filetype = sourceryfile.filetype;
        this.project = sourceryfile.project;
        this.status = sourceryfile.status;
        this.stage = sourceryfile.stage;
        this.stage_logs = sourceryfile.stage_logs;
        this.created_at = sourceryfile.created_at;
        this.updated_at = sourceryfile.updated_at;
    }

    load_metadata(uid: string): SourceryFile {
        if (!process.env.PROJECT_DIR) {
            throw new Error("Environment variable PROJECT_DIR not set");
        }
        this.uid = uid;
        // const dirname = path.join(process.env.PROJECT_DIR, this.project, uid);
        const metadata = path.join(this.dirname(), `metadata.json`);
        const data = fs.readFileSync(metadata, 'utf-8');
        const json = JSON.parse(data);
        return this.fromJSON(json);
    }

    fromJSON(json: any): SourceryFile {
        return {
            uid: json.uid,
            original_name: json.original_name,
            filename: json.filename,
            metadata: json.metadata,
            filetype: json.filetype,
            project: json.project,
            status: json.status,
            stage: json.stage,
            stage_logs: json.stage_logs,
            created_at: new Date(json.created_at),
            updated_at: new Date(json.updated_at)
        }
    }

    init(filename: string) {
        if (!process.env.PROJECT_DIR) {
            throw new Error("Environment variable PROJECT_DIR not set");
        }
        // Ensure that the file exists
        if (!fs.existsSync(filename)) {
            throw new Error(`File ${filename} does not exist`);
        }
        const uid = this.generateUID(filename);
        this.uid = uid;
        // const dirname = path.join(process.env.PROJECT_DIR, this.project, uid);
        const metadata = path.join(this.dirname(), `metadata.json`);
        if (fs.existsSync(metadata)) {
            return this.load_metadata(uid);
        }
        const original_name = path.basename(filename);
        const status = FileStatus.ACTIVE;
        const stage = FileStage.UNPROCESSED;
        const stage_logs: StageLog[] = [];
        const created_at = new Date();
        const updated_at = new Date();
        const filetype = this.getFiletype(filename);
        ensureDir(path.join(this.dirname(), stage));
        fs.copyFileSync(filename, path.join(this.dirname(), stage, path.basename(filename)));
        filename = path.join(this.dirname(), stage, path.basename(filename));
        const sourceryfile = {
            uid,
            filename,
            original_name,
            metadata,
            filetype,
            project: this.project,
            status,
            stage,
            stage_logs,
            created_at,
            updated_at
        }
        fs.writeFileSync(metadata, JSON.stringify(sourceryfile, null, 2));
        return sourceryfile;
    }

    generateUID(filename: string): string {
        // Generate an md5 hash of the file
        const hash = crypto.createHash('md5');
        const input = fs.readFileSync(filename);
        hash.update(input);
        return hash.digest('hex');
    }

    getFiletype(filename: string): FileTypes {
        const filetype = path.extname(filename).replace(".", "");
        return FileTypes[filetype.toUpperCase() as keyof typeof FileTypes];
    }

    setData(data: SourceryFile) {
        this.original_name = data.original_name || this.original_name;
        this.filename = data.filename || this.filename;
        this.metadata = data.metadata || this.metadata;
        this.filetype = data.filetype || this.filetype;
        this.status = data.status || this.status;
        this.stage = data.stage || this.stage;
        this.updated_at = new Date();
    }

    save() {
        this.updated_at = new Date();
        if (!this.metadata) {
            throw new Error("Metadata file not set");
        }
        fs.writeFileSync(this.metadata, JSON.stringify(this.toJSON(), null, 2));
    }

    writeStream(readstream: fs.ReadStream): fs.WriteStream {
        const dir = path.join(this.dirname(), this.stage);
        ensureDir(dir);
        const filename = path.join(dir, path.basename(this.filename));
        this.filename = filename;
        return readstream.pipe(fs.createWriteStream(filename));
    }

    write(data: string): void {
        const dir = path.join(this.dirname(), this.stage);
        ensureDir(dir);
        const filename = path.join(dir, path.basename(this.filename));
        this.filename = filename;
        fs.writeFileSync(filename, data);
    }

    toJSON(): SourceryFile {
        return {
            uid: this.uid,
            original_name: this.original_name,
            filename: this.filename,
            metadata: this.metadata,
            filetype: this.filetype,
            project: this.project,
            status: this.status,
            stage: this.stage,
            stage_logs: this.stage_logs,
            created_at: this.created_at,
            updated_at: this.updated_at
        }
    }

    dirname(): string {
        if (!process.env.PROJECT_DIR) {
            throw new Error("Environment variable PROJECT_DIR not set");
        }
        if (!this.uid) {
            throw new Error("UID not set");
        }
        return path.join(process.env.PROJECT_DIR, this.project, "files", this.uid);
    }

    async read() {
        return await readFile(this.filename, 'utf-8');
    }

    async readStream() {
        return fs.createReadStream(this.filename);
    }

    async readBuffer() {
        return fs.readFileSync(this.filename);
    }

    async readJSON() {
        return JSON.parse(await this.read());
    }

    async delete() {
        fs.rmSync(this.dirname(), { recursive: true, force: true });
    }

    async reindex() {
        if (!this.original_name) {
            throw new Error("Original name not set");
        }
        this.stage = FileStage.UNPROCESSED;
        this.filename = path.join(this.dirname(), this.stage, path.basename(this.original_name));
        this.save();
    }

}