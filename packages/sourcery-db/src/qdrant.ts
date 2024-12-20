import { SourceryDB } from "./soucery-db"
import type { SourceryDBRecord, SourceryDBRecordSearch } from "./soucery-db"
import fetch from 'node-fetch';

const url = process.env.QDRANT_URL || 'http://127.0.0.1:6333';

export class Qdrant implements SourceryDB {
    private url: string;

    constructor(options: {url?: string}) {
        this.url = options.url || url;
    }

    async getCollections(): Promise<string[]> {
        const response = await fetch(`${this.url}/collections`);
        const collections = (await response.json()).result.collections;
        return collections.map((collection: any) => collection.name);
    }

    async collectionExists(collection: string): Promise<boolean> {
        const collections = await this.getCollections();
        if (collections.includes(collection)) {
            return true;
        }
        return false;
    }

    async createCollection(collection: string) {
        if (await this.collectionExists(collection)) {
            return false;
        }
        const config = {
            vectors: {
                size: 768,
                distance: 'Cosine',
                on_disk: true
            }
        }
        const response = await fetch(`${this.url}/collections/${collection}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        await response.json();
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
        const result = await response.json();
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
        return await response.json();
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
        const result = await response.json();
        if (result.status !== "ok") {
            throw new Error(result.status?.error || "Unknown error");
        }
        return result;
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
        const result = await response.json();
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
                            "key": "filename",
                            "match": { "value": file_id } }
                    ]
                }
            })
        });
        await response.json();
    }

    async getInfo(collection: string): Promise<any> {
        const response = await fetch(`${this.url}/collections/${collection}`);
        const info = (await response.json()).result;
        return info;
    }
}