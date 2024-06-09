import type { SourceryFile, StageLog } from "@sourcery/common/types/SourceryFile.type.ts"
import type { File } from "@sourcery/common/src/file.ts"
import { StageState, StageResult } from "@sourcery/common/types/SourceryFile.type.ts"
import * as dotenv from "dotenv";
dotenv.config();

/**
 * 1. File comes in
 * 2. Emit "start"
 * 3. Original file is processed
 * 4. New file is saved
 * 5. Manifest is updated
 * 6. Emit "done"
**/
 

export class PipelineBase {
    protected file: File;
    protected previous_file: SourceryFile;
    protected time_start: Date;

    constructor(file: File) {
        this.time_start = new Date();
        // super();
        this.file = file;
        // this.previous_stage = "unprocessed";
        
        this.previous_file = Object.assign(file);
        file.stage = this.constructor.name;
        // Ensure that directory for this stage exists
        if (!process.env.PROJECT_DIR) {
            throw new Error("Environment variable PROJECT_DIR not set");
        }
        this.log(StageState.STARTED, null, "Stage started")
    }

    async process(): Promise<File> {
        this.log(StageState.FINISHED, StageResult.FAILURE, "Process not implemented")
        throw new Error("Method not implemented.");
    }

    log(state: StageState, result: StageResult | null, message: string) {
        const log = {} as StageLog;
        log.stage = this.file.stage;
        log.state = state;
        log.result = result;
        log.message = message;
        log.end_time = new Date();
        log.duration = log.end_time.getTime() - this.time_start.getTime();
        if (!this.file.stage_logs) {
            this.file.stage_logs = [];
        }
        this.file.stage_logs.push(log);
    }

    async done() {
        this.log(StageState.FINISHED, StageResult.SUCCESS, "Stage completed")
    }
}