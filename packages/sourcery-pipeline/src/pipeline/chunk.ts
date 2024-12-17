import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import type { TChunk } from "@sourcery/common/types/Chunks.type";
import * as fs from 'node:fs';
import path from "node:path";
import { randomUUID } from 'crypto';
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
            const root = this.chunkMarkdown(text, 1000);
            fs.writeFileSync(outputPath, JSON.stringify(root, null, 2));
        }
        return this.file;
    }

    chunkMarkdown(content: string, max_words: number = 1000): TChunk {
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
            const chunk: TChunk = {
                id: id,
                level: level,
                title: title,
                content: content,
                parent: parent.id,
                children: []
            }
            chunk.children = this.chunkByLevel(chunk);
            chunks.push(chunk);
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