import { chunk } from "llm-chunk";
import he from "he";
import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import * as fs from 'node:fs';

export class Chunk extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file);
    }
    
    async process() {
        const text = fs.readFileSync(this.file.filename, 'utf8');
        const chunks = this.chunkText(text, 1000);
        this.file.filename = this.file.filename.replace(/\.txt$/i, '.json');
        this.file.write(JSON.stringify(chunks, null, 2));
        return this.file;
    }

    chunkText(content: string, max_words: number) {
        function wordCount(text: string): number {
            return text.split(/\s+/).filter(word => word.length > 0).length;
        }

        function chunkParagraph(paragraph: string, max_words: number) {
            let sentences = paragraph.split(/(?<=\.)\s+/);
            let chunks = [];
            let currentChunk: string[] = [];

            sentences.forEach(sentence => {
                let currentWords = wordCount(currentChunk.join(' '));
                let sentenceWords = wordCount(sentence);

                if (currentWords + sentenceWords > max_words) {
                    chunks.push(currentChunk.join(' '));
                    currentChunk = [sentence]; // Start a new chunk with the current sentence
                } else {
                    currentChunk.push(sentence);
                }
            });
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.join(' '));
            }
            return chunks;
        }

        let paragraphs = content.split(/\n+/);
        let chunks: string[] = [];
        let currentChunk: string[] = [];

        paragraphs.forEach(paragraph => {
            let currentWords = wordCount(currentChunk.join(' '));
            let paragraphWords = wordCount(paragraph);

            if (paragraphWords > max_words) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk.join('\n'));
                    currentChunk = [];
                }
                // Break paragraph into sentences and process
                chunks = chunks.concat(chunkParagraph(paragraph, max_words));
            } else {
                if (currentWords + paragraphWords > max_words) {
                    chunks.push(currentChunk.join('\n'));
                    currentChunk = [paragraph]; // Start a new chunk with the current paragraph
                } else {
                    currentChunk.push(paragraph);
                }
            }
        });

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.join('\n'));
        }

        return chunks;
    }

    cleanContent(content: string) {
        // Remove everything in between <script>...</script> tags
        content = content.replace(/<script.*?>.*?<\/script>/g, '');
        // Replace all <br> tags with newlines
        content = content.replace(/<br>/g, '\n');
        // Replace all <br /> tags with newlines
        content = content.replace(/<br \/>/g, '\n');
        // Replace all <p> tags with newlines
        content = content.replace(/<p>/g, '\n');
        // Replace all </p> tags with newlines
        content = content.replace(/<\/p>/g, '\n');
        // Replace all <div> tags with newlines
        content = content.replace(/<div>/g, '\n');
        // Replace all </div> tags with newlines
        content = content.replace(/<\/div>/g, '\n');
        // Remove all HTML tags
        content = content.replace(/<[^>]*>/g, '');
        // Remove Wordpress shortcodes
        content = content.replace(/\[.*?\]/g, '');
        // Remove HTML entities
        content = he.decode(content);
        // Remove all leading and trailing whitespace
        content = content.trim();
        // Remove all double spaces
        content = content.replace(/  /g, ' ');
        // Normalize paragraph breaks
        content = content.replace(/\n\n+/g, '\n\n');
        content = content.replace(/\r\n/g, '\n\n');
        // No more than 2 newlines in a row
        content = content.replace(/\n{3,}/g, '\n\n');
        return content;
    }
}