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
import { logger, startTimer, endTimer, logError } from "@sourcery/common/src/logger";
dotenv.config();

export const httpServer = restify.createServer({
    log: logger
});
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
    const timerId = `rag_context_${project_name}`;
    const componentTimings = {};
    startTimer(timerId);
    startTimer(`${timerId}_embedding`);

    try {
        await ensure_model(vector_model);
        const vector = await ollama.embeddings({ model: vector_model, prompt: question });
        componentTimings.embedding = endTimer(`${timerId}_embedding`, { model: vector_model }, ['chat', 'rag', 'embedding']);

        startTimer(`${timerId}_qdrant_search`);
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
        componentTimings.qdrant_search = endTimer(`${timerId}_qdrant_search`, {
            result_count: qdrant_results?.length
        }, ['chat', 'rag', 'search']);

        logger.debug({
            msg: 'Qdrant search results',
            count: qdrant_results?.length,
            tags: ['chat', 'rag', 'search', 'debug']
        });

        if (!qdrant_results) {
            logger.warn({
                msg: 'No results found for query',
                project_name,
                question,
                tags: ['chat', 'rag', 'search', 'warning']
            });
            return [];
        }

        startTimer(`${timerId}_chunk_retrieval`);
        const results = [];
        for (let result of qdrant_results) {
            const chunk = await getChunkByQdrantID(result.id);
            if (chunk) {
                results.push(chunk);
            }
        }
        componentTimings.chunk_retrieval = endTimer(`${timerId}_chunk_retrieval`, {
            chunks_retrieved: results.length
        }, ['chat', 'rag', 'chunks']);

        startTimer(`${timerId}_reranking`);
        const contexts = results.map(result => `<filename>${result.file_id.original_name}</filename>\n<id>${result.id}</id>\n<context>${result.context || ""}</context>\n<content>${result.content}</content>`);
        const reranked = await rerank(question, contexts, RERANK_TOP_K);
        componentTimings.reranking = endTimer(`${timerId}_reranking`, {
            input_chunks: contexts.length,
            output_chunks: reranked.ranked_documents.length
        }, ['chat', 'rag', 'reranking']);

        const outliers = find_outliers(reranked);
        if (outliers.length > 0) {
            logger.info({
                msg: `Found outliers`,
                count: outliers.length,
                tags: ['chat', 'rag', 'outliers']
            });
            endTimer(timerId, {
                outliers_found: true,
                component_timings: componentTimings,
                vector_model,
                total_chunks: results.length
            }, ['chat', 'rag', 'complete']);
            return outliers;
        }

        endTimer(timerId, {
            component_timings: componentTimings,
            vector_model,
            total_chunks: results.length
        }, ['chat', 'rag', 'complete']);
        return reranked.ranked_documents;
    } catch (err) {
        logError(err, {
            project_name,
            question,
            component_timings: componentTimings,
            vector_model
        }, ['chat', 'rag', 'error']);
        throw new restifyErrors.InternalServerError("Error processing chat");
    }
}

httpServer.post("/chat/:project_id", async (req, res) => {
    const requestId = `chat_${req.params.project_id}_${Date.now()}`;
    const componentTimings = {};
    startTimer(requestId);

    try {
        const project_id = req.params.project_id;
        const { input, conversation_id, message_id, files } = req.body;

        // Validate request
        if (!project_id || !input || !message_id || !conversation_id) {
            const missingFields = [];
            if (!project_id) missingFields.push('project_id');
            if (!input) missingFields.push('input');
            if (!message_id) missingFields.push('message_id');
            if (!conversation_id) missingFields.push('conversation_id');

            logger.warn({
                msg: 'Missing required fields',
                missingFields,
                requestId,
                tags: ['chat', 'validation', 'warning']
            });
            throw new restifyErrors.BadRequestError(`Missing required fields: ${missingFields.join(', ')}`);
        }

        startTimer(`${requestId}_project_fetch`);
        // Get the project
        const project = await getProject(project_id);
        if (!project?._id) {
            logger.warn({
                msg: 'Project not found',
                project_id,
                requestId,
                tags: ['chat', 'project', 'warning']
            });
            throw new restifyErrors.NotFoundError("Project not found");
        }
        componentTimings.project_fetch = endTimer(`${requestId}_project_fetch`, {}, ['chat', 'project']);

        const model = req.body?.model || project?.model || MODEL;
        const temperature = req.body?.temperature || project?.temperature || TEMPERATURE;
        const top_k = req.body?.top_k || project?.top_k || TOP_K;
        const vector_model = req.body?.vector_model || project?.vector_model || VECTOR_MODEL;

        // Get the files to search
        startTimer(`${requestId}_files_fetch`);
        let files_to_search = [];
        if (files) {
            files_to_search = await getFiles(project_id, files);
        } else {
            files_to_search = (await getFiles(project_id)).filter(f => f.status === FileStatus.ACTIVE);
        }
        componentTimings.files_fetch = endTimer(`${requestId}_files_fetch`, {
            files_count: files_to_search.length
        }, ['chat', 'files']);

        // Get the context
        startTimer(`${requestId}_context`);
        const contextChunks = await get_rag_context(project_id, files_to_search, input, top_k, vector_model);
        componentTimings.context = endTimer(`${requestId}_context`, {}, ['chat', 'context']);

        startTimer(`${requestId}_chunk_processing`);
        let used_chunks = [];
        for (const chunk of contextChunks) {
            const id = chunk.document.match(/<id>(.*?)<\/id>/)?.[1];
            const c = await getChunkByQdrantID(id);
            if (c) {
                used_chunks.push(c._id);
            }
        }
        componentTimings.chunk_processing = endTimer(`${requestId}_chunk_processing`, {
            chunks_used: used_chunks.length
        }, ['chat', 'chunks']);

        const context = contextChunks.map(c => `<document>${c.document}</document>`).join("\n\n---\n\n");

        // Get the history of messages
        startTimer(`${requestId}_conversation_fetch`);
        const conversation = await getConversation(conversation_id);
        componentTimings.conversation_fetch = endTimer(`${requestId}_conversation_fetch`, {}, ['chat', 'conversation']);

        startTimer(`${requestId}_model_load`);
        try {
            await ensure_model(model);
            componentTimings.model_load = endTimer(`${requestId}_model_load`, { model }, ['chat', 'model', 'load']);
        } catch (err) {
            logError(err, { model, requestId }, ['chat', 'model', 'error']);
            throw new restifyErrors.InternalServerError("Error loading model");
        }

        startTimer(`${requestId}_chat`);
        const messages = rag_prompt_template(context, input, message_id, conversation);
        const chatResponse = await ollama.chat({
            model,
            messages,
            stream: false,
            options: { temperature }
        }).catch(err => {
            logError(err, { model, requestId }, ['chat', 'model', 'error']);
            throw new restifyErrors.InternalServerError("Error processing chat");
        });
        componentTimings.chat = endTimer(`${requestId}_chat`, {
            model,
            temperature,
            message_count: messages.length
        }, ['chat', 'model', 'inference']);

        // Update conversation with the response
        startTimer(`${requestId}_conversation_update`);
        const newMessage = {
            role: "assistant",
            content: chatResponse.message.content,
            chunk_ids: used_chunks,
        };
        conversation.messages.push(newMessage);
        await updateConversation({ _id: conversation_id, messages: conversation.messages });
        componentTimings.conversation_update = endTimer(`${requestId}_conversation_update`, {}, ['chat', 'conversation']);

        endTimer(requestId, {
            project_id,
            model,
            vector_model,
            temperature,
            chunks_used: used_chunks.length,
            component_timings: componentTimings,
            total_duration: Object.values(componentTimings).reduce((a, b) => a + b, 0)
        }, ['chat', 'complete']);

        // Send minimal JSON response
        res.send({
            conversation_id,
            message: newMessage
        });
    } catch (error) {
        logError(error, {
            requestId,
            component_timings: componentTimings
        }, ['chat', 'error']);
        throw new restifyErrors.InternalServerError("Error processing chat");
    }
});

httpServer.get("/test", async (req, res) => {
    res.send({ status: "ok" });
});

httpServer.listen({
    port: 9101,
    host: "0.0.0.0",
}, () => {
    logger.info({ msg: 'Chat API server started', port: 9101 });
    return connectDB(process.env.MONGO_URL || "mongodb://localhost:27017/sourcery")
});