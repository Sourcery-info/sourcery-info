// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import mongoose from 'mongoose';

export enum FileStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
    ARCHIVED = 'archived',
    ERROR = 'error',
}

export enum FileStage {
    UNPROCESSED = 'unprocessed',
    VALIDATING = 'validating',
    VIRUS_SCANNING = 'virus_scanning',
    DOCLING = 'docling',
    OCRING = 'ocr',
    ENTITY_EXTRACTION = 'entity_extraction',
    CHUNKING = 'chunking',
    VECTORISING = 'vectorising',
    VECTORISING_ENTITIES = 'vectorising_entities',
    INDEXING = 'indexing',
    PROCESSED = 'processed',
    SAVING = 'saving',
    DONE = 'done',
    ERROR = 'error',
    PDF_TO_IMAGE = 'pdf_to_image',
    EASYOCR = 'easyocr',
    LLAMA_MM = 'llama-mm',
    ENTITIES = 'entities',
    MONTAGE = 'montage',
    FILENAME = 'filename',
    MARKER_PDF = 'marker_pdf',
    CONTEXTUAL_CHUNKING = 'contextual-chunk',
    MAMMOTH = 'mammoth',
}

export enum FileTypes {
    PDF = 'pdf',
    DOCX = 'docx',
    XLSX = 'xlsx',
    CSV = 'csv',
    TXT = 'txt',
    JSON = 'json',
    XML = 'xml',
    HTML = 'html',
    JPG = 'jpg',
    JPEG = 'jpeg',
    PNG = 'png',
    GIF = 'gif',
    MP4 = 'mp4',
    MOV = 'mov',
    AVI = 'avi',
    MP3 = 'mp3',
    WAV = 'wav',
    ZIP = 'zip',
    TAR = 'tar',
    GZ = 'gz',
    BZ2 = 'bz2',
    RAR = 'rar',
    SEVENZ = '7z',
    UNKNOWN = 'unknown',
}

export enum StageState {
    STARTED = 'started',
    FINISHED = 'finished',
    FAILED = 'failed',
}

export enum StageResult {
    SUCCESS = 'success',
    FAILURE = 'failure',
    WARNING = 'warning',
}

export type StageLog = {
    stage: FileStage | string;
    input: SourceryFile | null;
    state: StageState;
    result: StageResult | undefined | null;
    message: string;
    start_time: Date;
    end_time: Date | null;
    duration: number;
    filename: string;
}

export type SourceryFile = {
    _id?: string;
    original_name?: string;
    filename: string;
    metadata?: string;
    filetype: FileTypes;
    project: string | mongoose.Schema.Types.ObjectId;
    user_id: string | mongoose.Schema.Types.ObjectId;
    status: FileStatus;
    stage: FileStage | string;
    stage_queue: FileStage[];
    stage_paths: { [key: string]: { directory: string; files: string[] } };
    completed_stages: FileStage[];
    last_filename?: string;
    processing: Boolean;
    last_stage?: FileStage | string;
    created_at: Date;
    updated_at: Date | null;
    checked?: boolean;
    stage_logs?: StageLog[];
    __v?: number;
}
