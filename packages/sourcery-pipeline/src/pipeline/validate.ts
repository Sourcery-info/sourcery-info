import { PipelineBase } from "./base"
import { FileTypes } from "@sourcery/common/types/SourceryFile.type";
import * as fs from 'node:fs/promises';
import isUft8 from "is-utf8";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";

export class Validate extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file, "validate");
    }
    
    async process() {
        let result = false;
        switch (this.file.filetype) {
            case FileTypes.PDF:
                try {
                    result = await this.validate_pdf();
                } catch (e) {
                    throw new Error(`File ${this.file._id} failed PDF validation`);
                }
                break;
            case FileTypes.TXT:
                try {
                    result = await this.validate_txt();
                } catch (e) {
                    throw new Error(`File ${this.file._id} failed text validation`);
                }
                break;
            default:
                throw new Error(`File ${this.file._id} has an invalid filetype`);
        }
        if (!result) throw new Error(`File ${this.file._id} failed validation`);
        console.log(`File ${this.file._id} passed validation`);
        return this.file;
    }

    async validate_pdf() {
        console.log(`Validating PDF file ${this.file._id}`);
        console.log(this.last_filename)
        const buf = fs.readFile(this.last_filename);
        if (Buffer.isBuffer(buf) && buf.lastIndexOf("%PDF-") === 0 && buf.lastIndexOf("%%EOF") > -1) {
            console.log(`File ${this.file._id} passed PDF validation`);
            return true;
        }
        console.log(`File ${this.file._id} failed PDF validation`);
        throw new Error(`File ${this.file._id} failed PDF validation`);
    }

    async validate_txt() {
        const buf = fs.readFile(this.last_filename);
        if (Buffer.isBuffer(buf) && isUft8(buf)) {
            // this.emit("info", `File ${this.file.filename} is a valid text file.`)
            return true;
        }
        // this.emit("warning", `File ${this.file.filename} is not a valid text file.`)
        return false;
    }
}