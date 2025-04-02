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

import { SourceryDB } from "./soucery-db"
import type { SourceryDBRecord, SourceryDBRecordSearch } from "./soucery-db"
import fetch from 'node-fetch';
import { AIModels } from "@sourcery/common/src/ai-models";

interface QdrantCollection {
    name: string;
}

interface QdrantCollectionConfig {
    result?: {
        config?: {
            vector_model?: string;
        };
    };
}

interface QdrantCollectionsResponse {
    result: {
        collections: QdrantCollection[];
    };
}

interface QdrantPointResponse {
    result: {
        id: string;
        payload: any;
        vector: number[];
    };
}

interface QdrantSearchResponse {
    result: Array<{
        id: string;
        payload: any;
        score: number;
    }>;
}

interface QdrantUpsertResponse {
    status: string;
    error?: string;
}

interface QdrantCollectionInfo {
    status: string;
    result: {
        status: string;
        vectors_count: number;
        points_count: number;
        segments_count: number;
        config: any;
    };
}

const url = process.env.QDRANT_URL || 'http://127.0.0.1:6333';

export class Qdrant implements SourceryDB {
    private url: string;

    constructor(options: {url?: string}) {
        this.url = options.url || url;
    }

    async getCollections(): Promise<string[]> {
        const response = await fetch(`${this.url}/collections`);
        const collections = (await response.json() as QdrantCollectionsResponse).result.collections;
        return collections.map((collection) => collection.name);
    }

    async collectionExists(collection: string): Promise<boolean> {
        const collections = await this.getCollections();
        if (collections.includes(collection)) {
            return true;
        }
        return false;
    }

    async createCollection(collection: string, dimensions: number = 768) {
        if (await this.collectionExists(collection)) {
            return false;
        }

        const config = {
            vectors: {
                size: dimensions,
                distance: 'Cosine',
                on_disk: true
            }
        }
        const createResponse = await fetch(`${this.url}/collections/${collection}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        await createResponse.json();
        return true;
    }

    async deleteCollection(collection: string): Promise<boolean> {
        if (!await this.collectionExists(collection)) {
            return false;
        }
        const response = await fetch(`${this.url}/collections/${collection}`, {
            method: 'DELETE'
        });
        await response.json();
        return true;    
    }

    async getOne(collection: string, id: string): Promise<any> {
        const response = await fetch(`${this.url}/collections/${collection}/points/${id}`);
        const result = await response.json() as QdrantPointResponse;
        return result.result;
    }

    async upsert(collection: string, id: string, data: any) {
        const response = await fetch(`${this.url}/collections/${collection}/upsert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id,
                data
            })
        });
        return await response.json() as QdrantUpsertResponse;
    }

    async addRecords(collection: string, records: SourceryDBRecord[]): Promise<void> {
        const points = records.map(record => ({
            id: record.id,
            vector: record.vectors,
            payload: record.data
        })).filter(r => r.vector.length > 0);
        const response = await fetch(`${this.url}/collections/${collection}/points?wait=true`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({points})
        });
        const result = await response.json() as QdrantUpsertResponse;
        if (result.status !== "ok") {
            throw new Error(result.error || "Unknown error");
        }
    }

    async search(collection: string, query: SourceryDBRecordSearch): Promise<any> {
        const search = {
            filter: query.filters,
            "params": {
                "hnsw_ef": 128,
                "exact": false
            },
            limit: query.top,
            vector: query.vectors,
            "with_payload": true
        }
        const response = await fetch(`${this.url}/collections/${collection}/points/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(search)
        });
        const result = await response.json() as QdrantSearchResponse;
        return result.result;
    }

    async deleteRecord(collection: string, id: string): Promise<void> {
        const response = await fetch(`${this.url}/collections/${collection}/points/delete`, {
            method: 'POST',
            body: JSON.stringify({
                "filter": {
                    "must": [
                        {
                            "key": "file_uid",
                            "match": {
                                "value": id
                            }
                        }
                    ]
                }
            })
        });
        await response.json();
    }

    async deleteFile(collection: string, file_id: string): Promise<void> {
        const response = await fetch(`${this.url}/collections/${collection}/points/delete`, {
            method: 'POST',
            body: JSON.stringify({
                "filter": {
                    "must": [
                        {
                            "key": "file_id",
                            "match": { "value": file_id } }
                    ]
                }
            })
        });
        await response.json();
    }

    async getInfo(collection: string): Promise<any> {
        const response = await fetch(`${this.url}/collections/${collection}`);
        const info = (await response.json() as QdrantCollectionInfo).result;
        return info;
    }
}