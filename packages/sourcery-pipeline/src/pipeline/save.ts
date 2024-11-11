import { Qdrant } from "@sourcery/sourcery-db/src/qdrant";
import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type.ts"
import { readFile, writeFile } from "fs/promises";

export class Save extends PipelineBase {
    private client: Qdrant;

    constructor(file: SourceryFile) {
        super(file, "json");
        this.client = new Qdrant({ url: process.env.QDRANT_URL || "http://localhost:6333", });
    }
    
    async process() {
        const collection = this.file.project;
        await this.client.createCollection(collection);
        const data = await readFile(this.last_filename, "utf8");
        const points = JSON.parse(data).map((item: any) => ({
            id: item.id,
            vectors: item.vectors,
            data: {
                text: item.text,
                ...this.file
            }
        }));
        await this.client.addRecords(collection, points);
        // await writeFile(this.filename, JSON.stringify(result));
        return this.file;
    }
}