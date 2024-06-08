import { SourceryFile } from '@sourcery/common/types/SourceryFile.type';

export type SourceryDBRecord = {
    id: string
    vectors: number[]
    data: SourceryFile
}

export type SourceryDBRecordSearch = {
    vectors: number[]
    top: number
    filters: any
}

export class SourceryDB {
    constructor(options: any) {
        throw new Error('Not implemented');
    }
    async collectionExists(collection: string): Promise<boolean> {
        throw new Error('Not implemented');
    }
    async createCollection(collection: string): Promise<boolean> {
        throw new Error('Not implemented');
    }
    async deleteCollection(collection: string): Promise<boolean> {
        throw new Error('Not implemented');
    }
    async addRecords(collection: string, record: SourceryDBRecord[]): Promise<void> {
        throw new Error('Not implemented');
    }
    async deleteRecord(collection: string, id: string): Promise<void> {
        throw new Error('Not implemented');
    }
    // async updateRecord(collection: string, record: any): Promise<void> {
    //     throw new Error('Not implemented');
    // }
    async search(collection: string, query: any): Promise<any> {
        throw new Error('Not implemented');
    }
}