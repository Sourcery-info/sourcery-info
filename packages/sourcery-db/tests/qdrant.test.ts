import { Qdrant } from "../src/qdrant";
import type { SourceryDBRecord, SourceryDBRecordSearch } from "../src/soucery-db"
const client = new Qdrant({ url: "http://localhost:6333" });
const collection_name = "test-collection";
import fs from "fs/promises";
let data: SourceryDBRecord[] = [];
let query: any;
describe("Test qdrant", () => {
    beforeAll(async () => {
        data = JSON.parse(await fs.readFile("./packages/sourcery-db/tests/abramov.json", "utf-8"))
            .map((item: {
                text: string;
                vector: {
                    embedding: number[];
                };
            }) => ({
                id: new Date().getTime(),
                vectors: item.vector.embedding,
                data: {
                    text: item.text,
                },
            }));
        query = JSON.parse(await fs.readFile("./packages/sourcery-db/tests/query.json", "utf-8"));
    });
    afterAll(async () => {
        await client.deleteCollection(collection_name);
    });
    test("test create collection", async () => {
        const result = await client.createCollection(collection_name);
        expect(result).toBe(true);
    });
    test("test collection exists", async () => {
        const result = await client.collectionExists(collection_name);
        expect(result).toBe(true);
    });
    test("test add records", async () => {
        // console.log(data)
        await client.addRecords(collection_name, data);
    });
    test("test search", async () => {
        const result = await client.search(collection_name, {
            vectors: query.embedding,
            top: 5,
            filters: {},
        });
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result[0]).toHaveProperty("id");
        expect(result[0]).toHaveProperty("score");
        expect(result[0]).toHaveProperty("payload");
        expect(result[0].payload).toHaveProperty("text");
    });
});