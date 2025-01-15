import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import type { TChunk } from "@sourcery/common/types/Chunks.type";
import * as fs from 'node:fs';
import path from "node:path";
import { randomUUID } from 'crypto';
import { encodingForModel } from "js-tiktoken";

const MIN_CHUNK_LENGTH = 20;

const encoding = encodingForModel("gpt-4o");
export class ChunkingPipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file, "json", "chunks");
    }
    
    async process() {
        // Read files from markdown step
        const mdFiles = ChunkingPipeline.stage_paths.md.files;
        for (const mdFile of mdFiles) {
            // Ensure file ends in .md
            if (!mdFile.endsWith('.md')) {
                continue;
            }
            const inputPath = path.join(this.filepath, "md", mdFile);
            const outputPath = path.join(this.filepath, "chunks", mdFile.replace('.md', '.json'));
            const text = fs.readFileSync(inputPath, 'utf8');
            const root = this.chunkMarkdown(text);
            this.processEmptyChunks(root);
            fs.writeFileSync(outputPath, JSON.stringify(root, null, 2));
        }
        return this.file;
    }

    private processEmptyChunks(chunk: TChunk): TChunk {
        if (chunk.children?.length === 0) {
            console.log(`Chunk ${chunk.id} has no children, chunking by paragraph`);
            chunk.children = this.chunkByParagraph(chunk);
        } else {
            // Recursively process all children
            for (const child of chunk.children || []) {
                this.processEmptyChunks(child);
            }
        }
        return chunk;
    }

    chunkMarkdown(content: string): TChunk {
        const root: TChunk = {
            id: randomUUID(),
            level: 0,
            title: "root",
            content: content,
            parent: null,
            children: []
        }
        root.children = this.chunkByLevel(root);
        return root;
    }

    private chunkByLevel(parent: TChunk): TChunk[] {
        const chunks: TChunk[] = [];
        const level = parent.level + 1;
        const headingRegex = new RegExp(`^#{${level}}\\s`, 'gm');
        const anyHeadingsRegex = new RegExp(`^#{1,6}\\s`, 'gm');
        if (!parent.content.match(anyHeadingsRegex)) {
            console.log(`No deeper headings at this level: ${level}`);
            return [];
        }
        const parts = parent.content.split(headingRegex);
        for (let i = 0; i < parts.length; i++) {
            const content = `${parts[i]}`;
            const title = parts[i].split('\n')[0];
            const id = randomUUID();
            const tokens = encoding.encode(content);
            // Ignore short chunks
            if (tokens.length < MIN_CHUNK_LENGTH) {
                continue;
            }
            const chunk: TChunk = {
                id: id,
                level: level,
                title: title,
                content: content,
                parent: parent.id || null,
                children: [],
                tokens: tokens.length
            }
            chunk.children = this.chunkByLevel(chunk);
            chunks.push(chunk);
        }
        return chunks;
    }

    private chunkByParagraph(parent: TChunk): TChunk[] {
        const chunks: TChunk[] = [];
        const paragraphs = parent.content.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        let chunk_count = 0;
        for (const paragraph of paragraphs) {
            const tokens = encoding.encode(paragraph);
            // Ignore short chunks
            if (tokens.length < MIN_CHUNK_LENGTH) {
                continue;
            }
            const title = `${parent.title} - ${chunk_count}`;
            const chunk: TChunk = {
                id: randomUUID(),
                level: parent.level + 1,
                title: title,
                content: paragraph,
                parent: parent.id || null,
                children: [],
                tokens: tokens.length
            }
            chunks.push(chunk);
            chunk_count++;
        }
        return chunks;
    }

    /**
     * Flattens a chunk tree into an array of chunks
     */
    static flattenChunks(chunk: TChunk): TChunk[] {
        let chunks: TChunk[] = [chunk];
        if (!chunk.children) {
            return chunks;
        }
        for (const child of chunk.children) {
            chunks = chunks.concat(this.flattenChunks(child));
        }
        return chunks;
    }
}