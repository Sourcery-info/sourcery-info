import { PipelineBase } from "./base"
import { SourceryFile, FileTypes } from "@sourcery/common/types/SourceryFile.type";
import { File } from "@sourcery/common/src/file";
import * as fs from 'node:fs/promises';
import isUft8 from "is-utf8";

export class Validate extends PipelineBase {

    constructor(file: File) {
        super(file);
    }
    
    async process() {
        console.log(this.file)
        let result = false;
        switch (this.file.filetype) {
            case FileTypes.PDF:
                result = await this.validate_pdf();
                break;
            case FileTypes.TXT:
                result = true;
                break;
            default:
                break;
        }
        if (!result) throw new Error(`File ${this.file.filename} failed validation`);
        return this.file;
    }

    async validate_pdf() {
        const buf = await fs.readFile(this.file.filename);
        if (Buffer.isBuffer(buf) && buf.lastIndexOf("%PDF-") === 0 && buf.lastIndexOf("%%EOF") > -1) {
            return true;
        }
        throw new Error(`File ${this.file.filename} failed PDF validation`);
    }

    async validate_txt() {
        const buf = await fs.readFile(this.file.filename);
        if (Buffer.isBuffer(buf) && isUft8(buf)) {
            // this.emit("info", `File ${this.file.filename} is a valid text file.`)
            return true;
        }
        // this.emit("warning", `File ${this.file.filename} is not a valid text file.`)
        return false;
    }
}