import restify from "restify"
import restifyErrors from "restify-errors"
import { Ollama } from "ollama";
import bodyParser from 'body-parser';
import { Qdrant } from "@sourcery/sourcery-db/src/qdrant.ts";
import { getProject } from "@sourcery/frontend/src/lib/classes/projects.ts";
import { getFiles } from "@sourcery/frontend/src/lib/classes/files.ts";
import dotenv from "dotenv";
dotenv.config();

export const httpServer = restify.createServer();
httpServer.use(bodyParser.json());
const MODEL = "llama3.2:latest"
const VECTOR_MODEL = "all-minilm:latest"

const ollama = new Ollama({ host: process.env.OLLAMA_URL || "http://localhost:11434" });

const ensure_model = async (model) => {
    const response = await ollama.list();
    const models = response.models;
    console.log(JSON.stringify(models, null, 2))
    if (!models.map(m => m.model).includes(model)) {
        console.log(`Pulling model ${model}`)
        await ollama.pull({ model: model, force: true });
    }
}

httpServer.get("/", async () => {
    return { hello: "world" };
});

const rag_prompt_template = (context, question) => [
    {
        role: "system",
        content: "You are an investigative journalist, able to find the most interesting facts and important information buried in boring documents. Using the information contained in the context, give a comprehensive answer to the question. Respond only to the question asked. The response should be concise and relevant to the question. Provide the filename of the source document when relevant. If the answer cannot be deduced from the context, politely decline to give an answer."
    },
    {
        role: "user",
        content: `Context:\n${context}\n---\nHere is the question you need to answer.\n\nQuestion: ${question}`
    },
];

const get_rag_context = async (project_name, files, question, top_k = 5) => {
    try {
        console.log({ project_name, files, question, top_k })
        await ensure_model(VECTOR_MODEL);
        const vector = await ollama.embeddings({ model: VECTOR_MODEL, prompt: question });

        // console.log({ files })
        const file_query = {
            key: "file_uid",
            match: {
                any: files.map(f => f.uid),
            }
        }

        const query = {
            top: top_k,
            vectors: vector.embedding,
            filters: {
                must: [file_query],
            }
        }
        const qdrant = new Qdrant({
            url: process.env.QDRANT_URL || "http://localhost:6333",
        });
        const results = await qdrant.search(project_name, query);
        if (!results) {
            console.log(`No results found for query`);
            return [];
        }
        const context = results.map(result => `Filename: ${result.payload.original_name}\n${result.payload.text}`).join("\n\n---\n\n");
        return context;
    } catch (err) {
        console.error(err);
        throw new restifyErrors.InternalServerError("Error processing chat");
    }
}

httpServer.post("/chat/:project_id", async (req, res) => {
    const project_id = req.params.project_id;
    if (!project_id) {
        throw new restifyErrors.BadRequestError("No project provided");
    }
    if (!req.body?.input) {
        throw new restifyErrors.BadRequestError("No input provided");
    }
    const project = await getProject(project_id);
    if (!project?._id) {
        throw new restifyErrors.NotFoundError("Project not found");
    }
    const files = await getFiles(project_id);
    const { input } = req.body;
    const context = await get_rag_context(project_id, files, input);
    const messages = rag_prompt_template(context, input);
    try {
        await ensure_model(MODEL);
    } catch (err) {
        console.error(err);
        throw new restifyErrors.InternalServerError("Error processing chat");
    }
    const chatStream = await ollama.chat({ model: MODEL, messages, stream: true }).catch(err => {
        console.error(err);
        throw new restifyErrors.InternalServerError("Error processing chat");
    });
    const response_log = [];
    try {
        for await (const response of chatStream) {
            res.write(response.message.content);
            response_log.push(response.message.content);
            if (response.done) {
                return res.end();
            }
        }
    } catch (error) {
        console.error(error);
        new restifyErrors.InternalServerError("Error processing chat");
    }
    // console.log(response_log);
    res.end();
})

httpServer.get("/test", async (req, res) => {
    res.send({ str: "Hello, World!" });
});

httpServer.listen({
    port: 9101,
    host: "0.0.0.0",
})