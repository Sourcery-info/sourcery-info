import { Qdrant } from "@sourcery/sourcery-db/src/qdrant";
import { PipelineBase } from "./base"
import type { SourceryFile, StageLog } from "@sourcery/common/types/SourceryFile.type.ts"

export class Save extends PipelineBase {
    private client: Qdrant;

    constructor(file: SourceryFile) {
        super(file);
        this.client = new Qdrant({ url: process.env.QDRANT_URL || "http://localhost:6333", });
    }
    
    async process() {
        
        const collection = this.file.project;
        await this.client.createCollection(collection);
        const points = data.map((item: any) => ({
            id: item._id,
            vectors: item.vectors,
            data: {
                text: item.text,
                original_name: this.file.original_name,
                file_uid: this.file.uid,
            }
        }));
        await this.client.addRecords(collection, points);
        return this.file;
    }
}