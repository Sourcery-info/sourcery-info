import { PipelineBase } from "./base";
import path from "path";
import { execCommand } from "../execCommand";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import fs from "fs";
interface MarkerPDFOptions {
    outputFormat?: 'markdown' | 'json' | 'html';
    pageRange?: string;
    forceOcr?: boolean;
    processors?: string[];
    configJson?: string;
    languages?: string[];
    debug?: boolean;
}

export class MarkerPDFPipeline extends PipelineBase {
    private options: MarkerPDFOptions;

    constructor(file: SourceryFile, options: MarkerPDFOptions = {}) {
        super(file, 'md', 'md');
        this.options = options;
        console.log("MarkerPDF Pipeline constructor");
    }
    
    private buildCommand(): string {
        const unprocessed_file = path.join(MarkerPDFPipeline.stage_paths.unprocessed.directory, MarkerPDFPipeline.stage_paths.unprocessed.files[0]);
        // Check if the file exists
        if (!fs.existsSync(unprocessed_file)) {
            console.error(`File not found: ${unprocessed_file}`);
            throw new Error(`File not found: ${unprocessed_file}`);
        }
        const commands: string[] = [
            '/app/sourcery-ocr-env/bin/marker_single',
            unprocessed_file,
            `--output_dir ${path.join(this.filepath, this.stage_name)}`
        ];

        if (this.options.outputFormat) {
            commands.push(`--output_format ${this.options.outputFormat}`);
        }
        if (this.options.pageRange) {
            commands.push(`--page_range "${this.options.pageRange}"`);
        }
        if (this.options.forceOcr) {
            commands.push('--force_ocr');
        }
        if (this.options.processors?.length) {
            commands.push(`--processors "${this.options.processors.join(',')}"`);
        }
        if (this.options.configJson) {
            commands.push(`--config_json ${this.options.configJson}`);
        }
        if (this.options.languages?.length) {
            commands.push(`--languages "${this.options.languages.join(',')}"`);
        }
        if (this.options.debug) {
            commands.push('--debug');
        }

        return commands.join(' ');
    }

    // Marker PDF outputs a directory with the same name as the file, but without the .pdf extension. We want to move the contents of the directory one level up.
    fix_directory_structure() {
        const directory = path.join(this.filepath, this.stage_name);
        const files = fs.readdirSync(directory);
        for (const file of files) {
            fs.renameSync(path.join(directory, file), path.join(this.filepath, file));
        }
        fs.rmdirSync(directory);
        fs.renameSync(path.join(this.filepath, this.file.filename), path.join(this.filepath, 'md'));
    }

    async process() {
        try {
            const command = this.buildCommand();
            const result = await execCommand(command);
            console.log(result);
            this.fix_directory_structure();
        } catch (error) {
            console.error(error);
            throw error;
        }
        return this.file;
    }
} 