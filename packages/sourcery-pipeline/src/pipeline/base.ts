import type { SourceryFile, StageLog, FileStage } from "@sourcery/common/types/SourceryFile.type.ts"
import { StageState, StageResult } from "@sourcery/common/types/SourceryFile.type"
import { SourceryPub } from "@sourcery/queue/src/pub";
import { updateFile } from "@sourcery/frontend/src/lib/classes/files";
import { ensureDir } from "@sourcery/common/src/utils"
import * as dotenv from "dotenv";
import path from "path";
import { getFilepath } from "@sourcery/frontend/src/lib/utils/files";
import fs from "fs/promises";
import { existsSync } from "fs";
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

    constructor(file: SourceryFile, stage_name: string = "") {
        if (!file.project) {
            throw new Error("File project is required");
        }
        if (!file._id) {
            throw new Error("File _id is required");
        }
        if (!stage_name) {
            throw new Error("Stage name is required");
        }
        this.stage_name = stage_name;
        this.time_start = new Date();
        this.file = file;
        this.file.stage = this.stage_name;
        console.log(`File ${file._id} has started stage ${file.stage}`);
        this.filepath = getFilepath(file.project, file._id);
        this.filename = path.join(this.filepath, file.stage, file.filename + "." + file.filetype);
        this.last_filename = file.last_filename || file.filename;

        // Ensure that directory for this stage exists
        const project_dir = process.env.PROJECT_DIR;
        if (!project_dir) {
            throw new Error("Environment variable PROJECT_DIR not set");
        }
        ensureDir(path.join(project_dir, file.project));
        this.file.processing = true;
        updateFile(this.file);
        this.log(StageState.STARTED, null, "Stage started")
    }

    async process(): Promise<SourceryFile> {
        console.log(`Processing ${this.stage_name} Pipeline`);
        // this.log(StageState.FINISHED, StageResult.FAILURE, "Process not implemented")
        // throw new Error("Method not implemented.");
        return this.file;
    }

    log(state: StageState, result: StageResult | null, message: string) {
        // const log = {} as StageLog;
        // log.stage = this.file.stage;
        // log.state = state;
        // log.result = result;
        // log.message = message;
        // log.end_time = new Date();
        // log.duration = log.end_time.getTime() - this.time_start.getTime();
        // if (!this.file.stage_logs) {
        //     this.file.stage_logs = [];
        // }
        // this.file.stage_logs.push(log);
    }

    async done() {
        this.file.processing = false;
        this.file.last_filename = this.file.filename;
        const stagePath = path.join(this.filepath, this.file.stage);
        const stageFile = path.join(stagePath, this.file.filename + "." + this.file.filetype);
        
        if (!existsSync(stageFile)) {
            const previousStage = this.file.completed_stages[this.file.completed_stages.length - 1];
            const previousPath = path.join(this.filepath, previousStage);
            const previousFile = path.join(previousPath, this.file.filename + "." + this.file.filetype);
            ensureDir(stagePath);
            await fs.copyFile(previousFile, stageFile);
        }
        this.file.completed_stages.push(this.file.stage as FileStage);
        this.file.stage = this.file.stage_queue.shift() as FileStage;
        updateFile(this.file);
        if (this.file.stage) {
            const pub = new SourceryPub(`file-${this.file.stage}`);
            await pub.addJob(`file-${this.file.stage}-${this.file._id}`, this.file);
            console.log(`File ${this.file._id} has completed stage ${this.file.stage} and is queued for ${this.file.stage_queue[0]}`);
        } else {
            console.log(`File ${this.file._id} has completed stage ${this.file.stage} and is not queued for any further stages`);
        }
        // if (!this.file.stage_logs) {
        //     this.file.stage_logs = [];
        // }
        // this.file.stage_logs.push({
        //     stage: this.file.stage,
        //     state: StageState.FINISHED,
        //     result: StageResult.SUCCESS,
        //     message: "Stage completed",
        //     end_time: new Date(),
        //     duration: 0,
        //     start_time: this.time_start,
        //     input: this.previous_file,
        //     filename: this.file.filename,
        // });
        // this.log(StageState.FINISHED, StageResult.SUCCESS, "Stage completed")
    }
}