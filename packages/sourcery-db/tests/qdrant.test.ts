// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { Qdrant } from "../src/qdrant";
import type { SourceryDBRecord, SourceryDBRecordSearch } from "../src/soucery-db"
const client = new Qdrant({ url: process.env.QDRANT_URL || "http://localhost:6333", });
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