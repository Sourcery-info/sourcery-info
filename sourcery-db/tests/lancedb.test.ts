import { LanceDB, Field, Int32, Utf8 } from "../src/lancedb.ts";

// const test = async () => {
//     const uri = "data/sample-lancedb";

//     console.time("LanceDB test");
//     const db = new LanceDB();
//     console.log("Connect to database");
//     await db.connect({uri});

//     console.log(await db.tableNames());
//     for (const table of await db.tableNames()) {
//         await db.dropTable(table);
//     }

//     console.log("Create table without schema");
//     await db.createTable(
//         "noSchemaTable",
//         undefined,
//         [
//             { vector: [3.1, 4.1], item: "foo", price: 10.0 },
//             { vector: [5.9, 26.5], item: "bar", price: 20.0 },
//         ],
//     );

//     console.log("Create table with schema");
//     const schema = [
//         new Field("id", new Int32()),
//         new Field("name", new Utf8()),
//     ];
//     await db.createTable("schemaTable", schema);

//     console.log("Get table names");
//     console.log(await db.tableNames());

//     console.log("Add data to table");
//     const newData = Array.from({ length: 500 }, (_, i) => ({
//         vector: [i, i + 1],
//         item: "fizz",
//         price: i * 0.1,
//     }));
//     await db.insert("noSchemaTable", newData);

//     const query = await db.search("noSchemaTable", [100, 100]);

//     console.log("Search result");
//     console.log(query);

//     // console.log("Create index");
//     // await tbl.createIndex({
//     //     type: "ivf_pq",
//     //     num_partitions: 2,
//     //     num_sub_vectors: 2,
//     // });

//     console.log("Delete item from table");
//     await db.delete("noSchemaTable", 'item = "fizz"');

//     console.log("Drop table");
//     await db.dropTable("noSchemaTable");


//     console.timeEnd("LanceDB test");
    
// }
const db = new LanceDB();
describe("LanceDB", () => {
    beforeAll(async () => {
        await db.connect({ uri: "data/test-lancedb" });
        const tables = await db.tableNames();
        for (const table of tables) {
            await db.dropTable(table);
        }
    });

    test("should create a new LanceDB instance", async () => {
        expect(db).toBeInstanceOf(LanceDB);
    });

    test("should be connected to a database", async () => {
        expect(db.connected).toBe(true);
    });

    test("should create a table without schema", async () => {
        const table = "noSchemaTable";
        const created = await db.createTable(table, undefined, [
            { vector: [3.1, 4.1], item: "foo", price: 10.0 },
            { vector: [5.9, 26.5], item: "bar", price: 20.0 },
        ]);
        expect(created).toBe(true);
    });

    test("should create a table with schema", async () => {
        const schema = [
            new Field("id", new Int32()),
            new Field("name", new Utf8()),
        ];
        const created = await db.createTable("schemaTable", schema);
        expect(created).toBe(true);
    });

    test("should return table names", async () => {
        const tableNames = await db.tableNames();
        expect(tableNames).toEqual(["noSchemaTable", "schemaTable"]);
    });

    test("should add data to table", async () => {
        const newData = Array.from({ length: 500 }, (_, i) => ({
            vector: [i, i + 1],
            item: "fizz",
            price: i * 0.1,
        }));
        await db.insert("noSchemaTable", newData);
    });

    test("should search for data in table", async () => {
        const result = await db.search("noSchemaTable", [100, 100], { limit: 5 });
        expect(result.length).toBe(5);
        expect (result[0].item).toBe("fizz");
    });

    test("should delete data from table", async () => {
        await db.delete("noSchemaTable", 'item = "fizz"');
    });

    test("should drop a table", async () => {
        await db.dropTable("noSchemaTable");
        const tableNames = await db.tableNames();
        expect(tableNames).toEqual(["schemaTable"]);
    });
});