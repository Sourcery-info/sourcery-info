import { chunk } from "llm-chunk";

import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";
import * as fs from 'node:fs';

export class Chunk extends PipelineBase {

    constructor(file: File) {
        super(file);
    }
    
    async process() {
        const text = fs.readFileSync(this.file.filename, 'utf8');
        const chunks = chunk(text, { splitter: "paragraph", maxLength: 512, minLength: 128, overlap: 32, });
        this.file.filename = this.file.filename.replace(/\.txt$/i, '.json');
        this.file.write(JSON.stringify(chunks, null, 2));
        return this.file;
    }
}