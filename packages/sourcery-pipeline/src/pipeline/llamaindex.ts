// import { SouceryLlamaIndex } from "@sourcery/sourcery-llm-api/src/llamaindex";
import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";
import path from "path";
import fetch from "node-fetch";

export class LlamaIndexPipeline extends PipelineBase {

    constructor(file: File) {
        super(file);
    }
    
    async process() {
        // const doc = await this.file.read();
        const collection = this.file.project;
        console.log(`Indexing collection: ${collection}`)
        // const llamaIndex = new SouceryLlamaIndex(collection);
        const filename = this.file.filename;
        const dir = path.dirname(filename);
        console.log(`Indexing directory: ${dir}`)
        // const result = await llamaIndex.indexDirectory(dir);
        const result = await fetch(`http://localhost:9100/index_documents/${collection}`);
        console.log(result.body);
        return this.file;
    }
}