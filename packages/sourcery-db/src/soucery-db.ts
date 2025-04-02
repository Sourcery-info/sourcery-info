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