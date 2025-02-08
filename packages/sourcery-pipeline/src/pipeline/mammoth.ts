import { PipelineBase } from "./base";
import path from "path";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import fs from "fs";
import mammoth from "mammoth";
import TurndownService from "turndown";
import { logger } from "@sourcery/common/src/logger";

interface MammothOptions {
    styleMap?: string[];
    includeDefaultStyleMap?: boolean;
    includeEmbeddedStyleMap?: boolean;
    ignoreEmptyParagraphs?: boolean;
    idPrefix?: string;
    transformDocument?: (element: any) => any;
}

export class MammothPipeline extends PipelineBase {
    private options: MammothOptions;
    private turndownService: TurndownService;

    constructor(file: SourceryFile, options: MammothOptions = {}) {
        super(file, 'md', 'md');
        this.options = options;
        this.turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            emDelimiter: '_',
            bulletListMarker: '*'
        });
        logger.info("Mammoth Pipeline constructor");
    }

    async process() {
        try {
            const unprocessed_file = path.join(MammothPipeline.stage_paths.unprocessed.directory, MammothPipeline.stage_paths.unprocessed.files[0]);
            
            // Check if the file exists
            if (!fs.existsSync(unprocessed_file)) {
                logger.error(`File not found: ${unprocessed_file}`);
                throw new Error(`File not found: ${unprocessed_file}`);
            }

            // Convert DOCX to HTML first
            const htmlResult = await mammoth.convertToHtml({ path: unprocessed_file }, this.options);
            const html = htmlResult.value;
            // Convert HTML to Markdown using turndown
            const markdown = this.turndownService.turndown(html);
            // Create the output directory if it doesn't exist
            const outputDir = path.join(this.filepath, "md");
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Write the Markdown output
            const outputFile = path.join(outputDir, this.file.filename + ".md");
            fs.writeFileSync(outputFile, markdown);
            return this.file;
        } catch (error) {
            logger.error("Error in Mammoth pipeline:", error);
            throw error;
        }
    }
}
