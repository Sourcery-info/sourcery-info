export class SourceryDB {
    connected: boolean;

    constructor() {
        this.connected = false;
    }

    async connect(params: {}): Promise<boolean> {
        this.connected = true;
        return true;
    }

    async tableNames(): Promise<string[]> {
        return [];
    }

    async tableExists(name: string): Promise<boolean> {
        return false;
    }

    async dropTable(name: string): Promise<void> {
    }

    async createTable(name: string, schema: any[], options: any): Promise<any> {
        return {};
    }

    async insert(table: string, row: any): Promise<void> {
    }

    async update(table: string, row: any): Promise<void> {
    }

    async addMany(table: string, rows: any[]): Promise<void> {
    }

    async delete(table: string, row: any): Promise<void> {
    }

    async search(table: string, query: any): Promise<any> {
        return {};
    }
}