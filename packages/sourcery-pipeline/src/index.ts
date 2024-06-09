import { SourceryQueue } from "./queue";
import { File } from "@sourcery/common/src/file.ts";
import { Validate } from "./pipeline/validate";
import { ExtractText } from "./pipeline/extract_text";
import { Chunk } from "./pipeline/chunk";
import { Vectorize } from "./pipeline/vectorize";
import { Save } from "./pipeline/save";
import { LlamaIndexPipeline } from "./pipeline/llamaindex";

import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const queue_order = [
    "unprocessed",
    "validating",
    "virus_scanning",
    "OCRing",
    "text_extraction",
    "chunking",
    "vectorizing",
    "saving",
    "done",
];

const processes = [
    {
        stage: "unprocessed",
        fn: (file: File) => {
            return true;
        },
    },
    {
        stage: "validating",
        fn: async (file: File) => {
            const validate = new Validate(file);
            await validate.process();
            console.log(`File ${file.uid} has completed stage ${file.stage}`);
        },
    },
    {
        stage: "virus_scanning",
        fn: (file: File) => {
            console.log(`File ${file.uid} has completed stage ${file.stage}`);
            return true;
        },
    },
    {
        stage: "llamaindex",
        fn: async (file: File) => {
            const llama_index = new LlamaIndexPipeline(file);
            await llama_index.process();
            console.log(`File ${file.uid} has completed stage ${file.stage}`);
            return true;
        },
    },
    {
        stage: "OCRing",
        fn: (file: File) => {
            console.log(`File ${file.uid} has completed stage ${file.stage}`);
            return true;
        },
    },
    {
        stage: "text_extraction",
        fn: async (file: File) => {
            const extract_text = new ExtractText(file);
            await extract_text.process();
            console.log(`File ${file.uid} has completed stage ${file.stage}`);
            return true;
        },
    },
    {
        stage: "chunking",
        fn: async (file: File) => {
            const chunk = new Chunk(file);
            await chunk.process();
            return true;
        },
    },
    {
        stage: "entity_extraction",
        fn: (file: File) => {
            console.log(`File ${file.uid} has completed stage ${file.stage}`);
            return true;
        },
    },
    {
        stage: "vectorizing",
        fn: async (file: File) => {
            const vectorize = new Vectorize(file);
            await vectorize.process();
            return true;
        },
    },
    {
        stage: "saving",
        fn: async (file: File) => {
            const save = new Save(file);
            await save.process();
            return true;
        },
    },
    {
        stage: "done",
        fn: (file: File) => {
            console.log(`File ${file.uid} has completed stage ${file.stage}`);
            return true;
        },
    },
];
async function main() {
    if (!process.env.PROJECT_DIR) {
        throw new Error("Environment variable PROJECT_DIR not set");
    }
    const ws_queue = new SourceryQueue("sourcery.info-ws");
    fs.watch(
        process.env.PROJECT_DIR,
        { recursive: true },
        async (eventType, filename) => {
            if (!filename) return;
            console.log(`${eventType}: ${filename}`);
            const parts = filename.split("/");
            if (parts.length !== 4) return;
            // Ensure the file is file/metadata.json
            // console.log(parts)
            if (parts[1] !== "files" || parts[3] !== "metadata.json") return;
            const project = parts[0];
            const uid = parts[2];
            try {
                const file = new File(project, uid);
                const next_stage =
                    queue_order[queue_order.indexOf(file.stage) + 1];
                if (!next_stage) return;
                const process = processes.find((p) => p.stage === next_stage);
                if (!process) return;
                console.log(`Next stage: ${next_stage}`);
                await process.fn(file);
                file.stage = next_stage;
                await file.save();
                await ws_queue.addJob(`${project}-file`, {
                    project,
                    file,
                });
            } catch (e) {
                console.error(e);
            }
        }
    );
}

main();
