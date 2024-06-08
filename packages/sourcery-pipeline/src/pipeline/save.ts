import { Qdrant } from "@sourcery/sourcery-db/src/qdrant";
import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";

export class Save extends PipelineBase {
    private client: Qdrant;

    constructor(file: File) {
        super(file);
        this.client = new Qdrant({});
    }
    
    async process() {
        const data = await this.file.readJSON();
        const collection = this.file.project;
        await this.client.createCollection(collection);
        const points = data.map((item: any) => ({
            id: item.id,
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