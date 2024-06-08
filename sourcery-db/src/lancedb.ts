import { SourceryDB } from "./sourcerydb.ts";
import * as lancedb from "vectordb";
// @ts-ignore
export { Schema, Field, Float32, FixedSizeList, Int32, Float16, Utf8 } from "apache-arrow";
// @ts-ignore
import { Schema } from "apache-arrow";

export class LanceDB extends SourceryDB {
    db: any;
    connection: any;
    constructor() {
        super();
        this.db = lancedb;
    }

    async connect(params: { uri: string }): Promise<any> {
        this.connection = await this.db.connect(params.uri);
        this.connected = true;
        return this.connection;
    }

    async _table(name: string) {
        return await this.connection.openTable(name);
    }

    async tableNames(): Promise<string[]> {
        return await this.connection.tableNames();
    }

    async tableExists(name: string): Promise<boolean> {
        return await this.connection.tableExists(name);
    }

    async dropTable(name: string): Promise<void> {
        await this.connection.dropTable(name);
    }

    async createTable(name: string, schema?: any[] | null, data?: any[], options?: any): Promise<boolean> {
        let opts = Object.apply({writeMode: lancedb.WriteMode.Overwrite}, options);
        if (!schema && data) {
            await this.connection.createTable(name, data, opts);
            return true;
        }
        if (!schema) {
            throw new Error("Schema or data required to create a table");
        }
        const s = new Schema(schema);
        await this.connection.createTable({ name, schema: s }, opts);
        return true;
    }

    async insert(table: string, row: any): Promise<void> {
        const t = await this._table(table);
        await t.add(row);
    }

    async update(table: string, row: any): Promise<void> {
        const t = await this._table(table);
        await t.update(row);
    }

    async addMany(table: string, rows: any[]): Promise<void> {
        const t = await this._table(table);
        await t.add(rows);
    }

    async delete(table: string, row: any): Promise<void> {
        const t = await this._table(table);
        await t.delete(row);
    }

    async search(table: string, vector: number[], options?: {
        limit?: number,
        where?: any,
    }): Promise<any> {
        options = Object.assign({ limit: 10 }, options);
        const t = await this._table(table);
        const q = t.search(vector);
        if (options.where) {
            q.where(options.where);
        }
        return await q.limit(options.limit).execute();
    }
}