import { PipelineBase } from "./base"
import { FileTypes } from "@sourcery/common/types/SourceryFile.type";
import { File } from "@sourcery/common/src/file";
import * as fs from 'node:fs';
import { spawn } from 'child_process';

export class ExtractText extends PipelineBase {

    constructor(file: File) {
        super(file);
    }
    
    async process() {
        switch (this.file.filetype) {
            case FileTypes.PDF:
                await this.pdf_to_txt();
                break;
            case FileTypes.TXT:
                await this.txt_to_txt();
                break;
            default:
                break;
        }
        return this.file;
    }

    pdf_to_txt() {
        return new Promise((resolve, reject) => {
            const pdf_filename = this.file.filename;
            // Change filename extension to .txt
            this.file.filename = pdf_filename.replace(/\.pdf$/i, '.txt');
            const pdf2txt = spawn('pdftotext', [pdf_filename, '-raw', '-nopgbrk', '-eol', 'unix', '-']);
            pdf2txt.stderr.on('data', (data) => {
                reject(new Error(`pdftotext error: ${data.toString()}`));
            });
            pdf2txt.on('error', (error) => {
                reject(new Error(`Failed to start pdftotext process: ${error.message}`));
            });
            this.file.writeStream(pdf2txt.stdout as fs.ReadStream);
            
            pdf2txt.on('close', (code) => {
                if (code === 0) {
                    resolve(true);
                } else {
                    reject(`pdftotext exited with code ${code}`);
                }
            });
        });
    }

    async txt_to_txt() {
        const buf = fs.createReadStream(this.file.filename);
        return this.file.writeStream(buf)
    }
}