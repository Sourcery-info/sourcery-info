import restify from "restify"
import restifyErrors from "restify-errors"
import { Ollama } from "ollama";
import bodyParser from 'body-parser';
import { Qdrant } from "@sourcery/sourcery-db/src/qdrant.ts";
import { getProject } from "@sourcery/frontend/src/lib/classes/projects.ts";
import { getFiles } from "@sourcery/frontend/src/lib/classes/files.ts";
import { getConversation, updateConversation } from "@sourcery/frontend/src/lib/classes/conversations.ts";
import { getChunkByQdrantID } from "@sourcery/frontend/src/lib/classes/chunks.ts";
import { connectDB } from '@sourcery/frontend/src/lib/server/db';
import dotenv from "dotenv";
import { rerank } from "@sourcery/common/src/reranker";
import { ensure_model } from "@sourcery/common/src/ollama";
import { FileStatus } from "@sourcery/common/types/SourceryFile.type";
dotenv.config();

export const httpServer = restify.createServer();
httpServer.use(bodyParser.json());
const MODEL = "llama3.2:latest"
const VECTOR_MODEL = "nomic-embed-text:latest"
const TEMPERATURE = 0.1
const TOP_K = 20
const RERANK_TOP_K = 10

const ollama = new Ollama({ host: process.env.OLLAMA_URL || "http://localhost:11434" });
const qdrant = new Qdrant({
    url: process.env.QDRANT_URL || "http://localhost:6333",
});

httpServer.get("/", async () => {
    return { status: "ok" };
});

const rag_prompt_template = (context, question, message_id, conversation) => [
    {
        role: "system",
        content: "You are named Sourcery, an AI that assists investigative journalists, able to find the most interesting facts and important information buried in boring documents. You will be given multiple chunks of information from different documents. Each chunk contains a filename, the context, and the relevant content. Using the information contained in the chunks, give a comprehensive answer to the question. Respond only to the question asked. The response should be concise and relevant to the question. Provide the filename of the source document when relevant. Quote the text from the document when relevant. Give as a complete answer as possible. If the answer cannot be deduced from the context, politely decline to give an answer. Answer in Markdown format."
    },
    ...conversation.messages.filter(m => m._id !== message_id).map(m => ({ role: m.role, content: m.content })),
    {
        role: "user",
        content: `Context:\n${context}\n---\nHere is the question you need to answer.\n\nQuestion: ${question}`
    },
];

const get_rag_context = async (project_name, files, question, top_k = TOP_K, vector_model = VECTOR_MODEL) => {

    // const get_parents = async (project_name, search_results) => {
    //     // If we match a chunk, we need to get the parent chunk
    //     const parents = new Set();
    //     const ids = search_results.map(s => s.id);
    //     for (const result of search_results) {
    //         if (result.payload.parent_id && !ids.includes(result.payload.parent_id)) {
    //             parents.add(result.payload.parent_id);
    //         }
    //     }
    //     const parent_results = [];
    //     for (const parent of parents) {
    //         const p = await qdrant.getOne(project_name, parent);
    //         if (p?.payload?.content) {
    //             parent_results.push(p);
    //         }
    //     }
    //     return parent_results;
    // }
    try {
        await ensure_model(vector_model);
        const vector = await ollama.embeddings({ model: vector_model, prompt: question });
        const file_query = {
            key: "filename",
            match: {
                any: files.map(f => f.filename),
            }
        }
        const query = {
            top: top_k,
            vectors: vector.embedding,
            filters: {
                must: [file_query],
            }
        }

        const results = await qdrant.search(project_name, query);
        if (!results) {
            console.log(`No results found for query`);
            return [];
        }
        // const parents = await get_parents(project_name, results);
        // console.log(`Found ${parents.length} parents from ${results.length} results`);
        const contexts = results.map(result => `<filename>${result.payload.original_name}</filename>\n<id>${result.id}</id>\n<context>${result.payload.context || ""}</context>\n<content>${result.payload.content}</content>`);
        const reranked = await rerank(question, contexts, RERANK_TOP_K);
        return reranked.ranked_documents;
    } catch (err) {
        console.error(err);
        throw new restifyErrors.InternalServerError("Error processing chat");
    }
}

httpServer.post("/chat/:project_id", async (req, res) => {
    try {
        const project_id = req.params.project_id;
        const { input, conversation_id, message_id, files } = req.body;
        // Make sure we have all the required fields
        if (!project_id) {
            throw new restifyErrors.BadRequestError("No project provided");
        }
        if (!input) {
            throw new restifyErrors.BadRequestError("No input provided");
        }
        if (!message_id) {
            throw new restifyErrors.BadRequestError("No message_id provided");
        }
        if (!conversation_id) {
            throw new restifyErrors.BadRequestError("No conversation_id provided");
        }
        // Get the project
        const project = await getProject(project_id);
        if (!project?._id) {
            throw new restifyErrors.NotFoundError("Project not found");
        }
        const model = req.body?.model || project?.model || MODEL;
        const temperature = req.body?.temperature || project?.temperature || TEMPERATURE;
        const top_k = req.body?.top_k || project?.top_k || TOP_K;
        const vector_model = req.body?.vector_model || project?.vector_model || VECTOR_MODEL;
        // Get the files to search
        let files_to_search = [];
        if (files) {
            files_to_search = await getFiles(project_id, files);
        } else {
            files_to_search = (await getFiles(project_id)).filter(f => f.status === FileStatus.ACTIVE);
        }
        // Get the context
        const chunks = await get_rag_context(project_id, files_to_search, input, top_k, vector_model);
        let used_chunks = [];
        for (const chunk of chunks) {
            const id = chunk.document.match(/<id>(.*?)<\/id>/)?.[1];
            const c = await getChunkByQdrantID(id);
            if (c) {
                used_chunks.push(c._id);
            }
        }
        const context = chunks.map(c => `<document>${c.document}</document>`).join("\n\n---\n\n");
        // Get the history of messages
        const conversation = await getConversation(conversation_id);
        try {
            await ensure_model(model);
        } catch (err) {
            console.error(err);
            throw new restifyErrors.InternalServerError("Error loading model");
        }
        const messages = rag_prompt_template(context, input, message_id, conversation);
        const chatStream = await ollama.chat({
            model,
            messages,
            stream: true,
            options: { temperature }
        }).catch(err => {
            console.error(err);
            throw new restifyErrors.InternalServerError("Error processing chat");
        });
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("Transfer-Encoding", "chunked");
        // res.write(`<chunks>${used_chunks.join(",")}</chunks>`);
        // res.write("<response>");
        const response_log = [];
        let response_content = "";
        try {
            for await (const response of chatStream) {
                res.write(response.message.content);
                response_log.push(response.message.content);
                response_content += response.message.content;
                if (response.done) {
                    // res.write("</response>");
                    conversation.messages.push({ role: "assistant", content: response_content, chunk_ids: used_chunks });
                    await updateConversation({ _id: conversation_id, messages: conversation.messages });
                    return res.end();
                }
            }
        } catch (error) {
            console.error(error);
            throw new restifyErrors.InternalServerError("Error processing chat");
        }
        res.end();
    } catch (error) {
        console.error(error);
        throw new restifyErrors.InternalServerError("Error processing chat");
    }
})

httpServer.get("/test", async (req, res) => {
    res.send({ status: "ok" });
});

httpServer.listen({
    port: 9101,
    host: "0.0.0.0",
}, () => {
    return connectDB(process.env.MONGO_URL || "mongodb://localhost:27017/sourcery")
})