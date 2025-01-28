import type { SourceryFile, StageLog, FileStage } from "@sourcery/common/types/SourceryFile.type"
import { StageState, StageResult } from "@sourcery/common/types/SourceryFile.type"
import { SourceryPub } from "@sourcery/queue/src/pub";
import { updateFile } from "@sourcery/frontend/src/lib/classes/files";
import { ensureDir } from "@sourcery/common/src/utils"
import * as dotenv from "dotenv";
import path from "path";
import { getFilepath } from "@sourcery/frontend/src/lib/utils/files";
import fs from "fs/promises";
import { existsSync } from "fs";
import { logger } from "@sourcery/common/src/logger";
dotenv.config();

/**
 * 1. File comes in
 * 2. File is processed
 * 3. File is saved
 * 4. Next stage is queued
**/
 

export class PipelineBase {
    protected file: SourceryFile;
    protected time_start: Date;
    protected filepath: string;
    protected filename: string;
    protected last_filename: string;
    protected stage_name: string;
    protected extension: string;
    protected directory_name: string;
    protected static stage_paths: { [key: string]: {
        directory: string;
        files: string[];
    } } = {};
    // protected input_type: string;
    // protected output_type: string;

    constructor(file: SourceryFile, extension: string | null = null, directory_name: string | null = null) {
        if (!file.project) {
            throw new Error("File project is required");
        }
        if (!file._id) {
            throw new Error("File _id is required");
        }
        // this.input_type = input_type;
        // this.output_type = output_type;
        this.stage_name = file.stage;
        this.time_start = new Date();
        this.file = file;
        this.file.stage = this.stage_name;
        this.filepath = getFilepath(file.project.toString(), file._id.toString());
        this.extension = extension || file.filetype;
        this.directory_name = directory_name || file.stage;
        this.filename = path.join(this.filepath, this.directory_name, file.filename + "." + this.extension);
        this.last_filename = this.file.last_filename || this.filename;
        PipelineBase.stage_paths = this.file.stage_paths || {};
        // Ensure that directory for this stage exists
        const project_dir = process.env.PROJECT_DIR;
        if (!project_dir) {
            throw new Error("Environment variable PROJECT_DIR not set");
        }
        ensureDir(path.join(this.filepath, this.directory_name));
        this.file.processing = true;
        updateFile(this.file);
        this.log(StageState.STARTED, null, "Stage started")
    }

    async process(): Promise<SourceryFile> {
        logger.info({ msg: `Processing ${this.stage_name} Pipeline`, file_id: this.file._id, tags: ['file', 'info'] });
        return this.file;
    }

    log(state: StageState, result: StageResult | null, message: string) {
        logger.info({ msg: `${this.file.stage} - ${state} - ${result} - ${message}`, file_id: this.file._id, tags: ['file', 'info'] });
    }

    async done() {
        this.file.processing = false;
        this.file.last_filename = this.filename;
        if (!existsSync(this.filename)) {
            this.filename = path.join(this.filepath, this.directory_name, this.file.filename + "." + this.extension);
            await fs.copyFile(this.last_filename, this.filename);
        }
        PipelineBase.stage_paths[this.directory_name] = {
            directory: path.join(this.filepath, this.directory_name),
            files: await fs.readdir(path.join(this.filepath, this.directory_name))
        };
        this.file.stage_paths = PipelineBase.stage_paths;
        this.file.completed_stages.push(this.file.stage as FileStage);
        this.file.stage = this.file.stage_queue.shift() as FileStage;
        updateFile(this.file);
        if (this.file.stage) {
            const pub = new SourceryPub(`file-${this.file.stage}`);
            await pub.addJob(`file-${this.file.stage}-${this.file._id}`, this.file);
            logger.info({ msg: `File ${this.file._id} has completed ${this.file.completed_stages.length} stages and is queued for ${this.file.stage}`, file_id: this.file._id, tags: ['file', 'info'] });
        } else {
            logger.info({ msg: `File ${this.file._id} has completed ${this.file.completed_stages.length} stages and is not queued for any further stages`, file_id: this.file._id, tags: ['file', 'info'] });
        }
    }
}