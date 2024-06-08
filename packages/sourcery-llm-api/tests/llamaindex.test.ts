import { SouceryLlamaIndex } from "../src/llamaindex"

const indexName = "test";
const llamaindex = new SouceryLlamaIndex(indexName);

describe("Test LlamaIndex indexing and retrieval", () => {
    // beforeAll(async() => {
    //     await llamaindex.setup();
    // });

    // test("Index some documents", async() => {
    //     await llamaindex.indexDocuments([]);
    // })

    test("Index a directory", async() => {
        await llamaindex.indexDirectory("../../docs");
    }, 30000)

    test("Retrieve some documents", async() => {
        const results = await llamaindex.retrieveDocuments("test");
        // console.log(results);
        expect(results.length).toBeGreaterThan(0);
    })

    test("Chat with the engine", async() => {
        const result = await llamaindex.syncChat("How old is the author?");
        // console.log(JSON.stringify(result.sourceNodes, null, 2));
        expect(result.response.length).toBeGreaterThan(0);
        expect(result.sourceNodes?.length).toBeGreaterThan(0);
    }, 60000);
    
})