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

function find_outliers(ranked_documents) {
    const scores = ranked_documents.ranked_documents.map(d => d.score);
    scores.sort((a, b) => a - b);

    // Calculate quartiles
    const q1_idx = Math.floor(scores.length * 0.25);
    const q3_idx = Math.floor(scores.length * 0.75);
    const q1 = scores[q1_idx];
    const q3 = scores[q3_idx];

    // Calculate IQR and bounds
    const iqr = q3 - q1;
    const upper_bound = q3 + (1.5 * iqr);

    // Return documents above upper bound (high outliers)
    return ranked_documents.ranked_documents.filter(d => d.score >= upper_bound);
}

const get_rag_context = async (project_name, files, question, top_k = TOP_K, vector_model = VECTOR_MODEL) => {
    try {
        await ensure_model(vector_model);
        const vector = await ollama.embeddings({ model: vector_model, prompt: question });
        const file_query = {
            key: "file_id",
            match: {
                any: files.map(f => f._id),
            }
        }
        const query = {
            top: top_k,
            vectors: vector.embedding,
            filters: {
                must: [file_query],
            }
        }

        const qdrant_results = await qdrant.search(project_name, query);
        console.log(qdrant_results);
        if (!qdrant_results) {
            console.log(`No results found for query`);
            return [];
        }
        const results = [];
        for (let result of qdrant_results) {
            const chunk = await getChunkByQdrantID(result.id);
            if (chunk) {
                results.push(chunk);
            }
        }
        const contexts = results.map(result => `<filename>${result.file_id.original_name}</filename>\n<id>${result.id}</id>\n<context>${result.context || ""}</context>\n<content>${result.content}</content>`);
        const reranked = await rerank(question, contexts, RERANK_TOP_K);
        const outliers = find_outliers(reranked);
        if (outliers.length > 0) {
            console.log(`Found ${outliers.length} outliers`);
            return outliers;
        }
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
        const contextChunks = await get_rag_context(project_id, files_to_search, input, top_k, vector_model);
        let used_chunks = [];
        for (const chunk of contextChunks) {
            const id = chunk.document.match(/<id>(.*?)<\/id>/)?.[1];
            const c = await getChunkByQdrantID(id);
            if (c) {
                used_chunks.push(c._id);
            }
        }
        const context = contextChunks.map(c => `<document>${c.document}</document>`).join("\n\n---\n\n");
        // Get the history of messages
        const conversation = await getConversation(conversation_id);
        try {
            await ensure_model(model);
        } catch (err) {
            console.error(err);
            throw new restifyErrors.InternalServerError("Error loading model");
        }
        const messages = rag_prompt_template(context, input, message_id, conversation);
        const chatResponse = await ollama.chat({
            model,
            messages,
            stream: false,
            options: { temperature }
        }).catch(err => {
            console.error(err);
            throw new restifyErrors.InternalServerError("Error processing chat");
        });

        // Update conversation with the response
        const newMessage = {
            role: "assistant",
            content: chatResponse.message.content,
            chunk_ids: used_chunks,
        };
        conversation.messages.push(newMessage);
        await updateConversation({ _id: conversation_id, messages: conversation.messages });

        // Send minimal JSON response
        res.send({
            conversation_id,
            message: newMessage
        });
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