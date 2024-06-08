import restify from "restify";
import { SouceryLlamaIndex } from "./llamaindex";
import bodyParser from 'body-parser';

type Conversation = {
    [conversation: string]: {
        [project: string]: SouceryLlamaIndex
    };
}

let conversations: Conversation = {};

export const httpServer = restify.createServer();
httpServer.listen(9100, "localhost");

httpServer.get("/test", async (req, res) => {
    res.send({ str: "Hello, World!" });
});

httpServer.post("/test_stream", async (req, res) => {
    for (let i = 0; i < 100; i++) {
        const random_char = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
        res.write(random_char);
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    res.end();
});

httpServer.get("/index_documents/:project", async (req, res) => {
    const project = req.params.project;
    const index = new SouceryLlamaIndex(project);
    res.header("Content-Type", "text/plain");
    // await index.setup();
    await index.indexDocuments([]);
    res.send("Indexed");
});

httpServer.get("/chat_test", async (req, res) => {
    const query = "How old is the author in 2024? Extrapolate from the essay.";
    const index = new SouceryLlamaIndex("test");
    res.header("Content-Type", "text/plain");
    await index.indexDocuments([]);
    await index.streamChat(query, res);
});

httpServer.get("/chat/:project/:query", async (req, res) => {
    const project: string = req.params.project;
    const input: string = req.params.query;
    const index = new SouceryLlamaIndex(project);
    res.header("Content-Type", "text/plain");
    await index.streamChat(input, res);
});

httpServer.use(bodyParser.json());

httpServer.post("/chat/:project", async (req, res) => {
    const project: string = req.params.project;
    const { input, conversation } = req.body;
    if (!conversations[project]) {
        conversations[project] = {};
    }
    if (!conversations[project][conversation]) {
        conversations[project][conversation] = new SouceryLlamaIndex(project);
        // await conversations[project][conversation].setup();
    }
    await conversations[project][conversation].streamChat(input, res);
    // const index = new SouceryLlamaIndex();
    // res.header("Content-Type", "text/stream");
    // await index.setup();
    // await index.chat(input, res);
});
